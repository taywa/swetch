import { basename, dirname, extname, join } from 'node:path'

/** @type {(options: { url: string, body?: any }) => 'rest' | 'graphql' | 'file'} */
export const resolve_request_type = options => {
  if (options.body?.operationName && options.body.variables) {
    return 'graphql'
  }

  const extension = extname(options.url)
  if (extension) {
    return 'file'
  }

  return 'rest'
}

/** @type {(request_variables: any) => string} */
const stringify_request_variables = request_variables =>
  Object.entries(request_variables)
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
    // TODO: hash part of name and value if too long
    .map(([name, value]) => `${name}:${JSON.stringify(value)}`)
    .join('|')

/** @type {options['resolve_file_path']} */
export const resolve_file_path = async (_, url, request) => {
  const url_dirname = dirname(url.pathname)
  const url_basename = basename(url.pathname)

  const get_variables = Object.fromEntries(url.searchParams.entries())
  const post_variables = request.body ? await request.json() : {}

  const request_type = resolve_request_type({
    url: request.url,
    body: post_variables,
  })

  switch (request_type) {
    case 'file': {
      const matches = url_basename.match(/^(.*)(\.[^.]+)$/)
      const [, name, dot_extension] = matches ?? [null, url_basename, '']
      const request_variables = Object.assign(get_variables, post_variables)
      const request_variables_string =
        stringify_request_variables(request_variables)

      const file_name = request_variables_string
        ? `${name}.${request_variables_string}${dot_extension}`
        : `${name}${dot_extension}`

      return join(url_dirname, file_name)
    }

    case 'rest': {
      const request_variables = Object.assign(get_variables, post_variables)
      const request_variables_string =
        stringify_request_variables(request_variables)

      const request_method = request.method.toLowerCase()
      const file_name = request_variables_string
        ? `${url_basename}.${request_method}.${request_variables_string}.json`
        : `${url_basename}.${request_method}.json`

      return join(url_dirname, file_name)
    }

    case 'graphql': {
      const { operationName, variables } = post_variables
      const request_variables = Object.assign(get_variables, variables)
      const request_variables_string =
        stringify_request_variables(request_variables)

      const file_name = request_variables_string
        ? `${operationName}.${request_variables_string}.json`
        : `${operationName}.json`

      return join(url.pathname, file_name)
    }
  }
}
