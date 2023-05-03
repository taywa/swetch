import { basename, dirname, extname, join } from 'node:path'
import { gql } from 'graphql-tag'
import { Kind } from 'graphql'

/** @type {(options: { url: string, body?: any }) => 'rest' | 'graphql' | 'file'} */
export const resolve_request_type = options => {
  if (options.body && (options.body?.operationName || options.body.query)) {
    return 'graphql'
  }

  const extension = extname(options.url)
  if (extension) {
    return 'file'
  }

  return 'rest'
}

/**
 * replace characters related to file paths (`/`, `\`, `.`) with underscores
 *
 * @type {(variable: string) => string}
 */
const escape_request_variable = variable => variable.replace(/[./\\]/g, '_')

/** @type {(request_variables: any) => string} */
const stringify_request_variables = request_variables =>
  Object.entries(request_variables)
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
    // TODO: hash part of name and value if too long
    .map(([name, value]) => {
      switch (typeof value) {
        case 'string':
          return `${name}:${escape_request_variable(value)}`
        case 'number':
          return `${name}:${escape_request_variable(value.toString())}`
      }

      return `${name}:${escape_request_variable(JSON.stringify(value))}`
    })
    .join('|')

/** @type {(definition_node: import('graphql').DefinitionNode) => definition_node is import('graphql').OperationDefinitionNode} */
const is_operation_definition_node = definition_node =>
  definition_node.kind === Kind.OPERATION_DEFINITION

/** @type {(selection_node: import('graphql').SelectionNode) => selection_node is import('graphql').FieldNode} */
const is_field_selection_node = selection_node =>
  selection_node.kind === Kind.FIELD

/** @type {(document_node: import('graphql').DocumentNode) => string} */
const graphql_file_name = document_node => {
  const operation_definition = document_node.definitions.find(
    is_operation_definition_node
  )

  if (!operation_definition) {
    throw new Error(
      `unable to get graphql file name. this possibly needs support, please submit an issue at https://github.com/taywa/swetch/issues/new with the following output:\n${document_node?.loc?.source.body}`
    )
  }

  if (operation_definition.name) {
    return operation_definition.name.value
  }

  const selection_names = operation_definition.selectionSet.selections
    .filter(is_field_selection_node)
    .map(selection_node => selection_node.name.value)
  const name = selection_names.join('+')

  return name
}

/** @type {options['resolve_file_path']} */
export const resolve_file_path = async (url, request) => {
  const url_dirname = dirname(url.pathname)
  const url_basename = basename(url.pathname)

  const get_variables = Object.fromEntries(url.searchParams.entries())
  const post_variables = request.body ? await request.json() : {}

  const request_type = resolve_request_type({
    url: url.href,
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
      const { query, variables } = post_variables

      const document_node = gql(query)
      const file_name = graphql_file_name(document_node)

      const request_variables = Object.assign(get_variables, variables)
      const request_variables_string =
        stringify_request_variables(request_variables)

      const file_basename = request_variables_string
        ? `${file_name}.${request_variables_string}.json`
        : `${file_name}.json`

      return join(url.pathname, file_basename)
    }
  }
}
