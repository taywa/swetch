/** @type {(source: string | RegExp | any) => RegExp} */
const Source = source => {
  switch (typeof source) {
    case 'string':
      return new RegExp(`^${source}.*`, 'i')
    case 'object':
      if (source instanceof RegExp) {
        return source
      }
  }

  throw new Error(
    `[from_url_map] arguments have to be of type \`[string | RegExp, string | resolve_url]\`. unsupported source: ${JSON.stringify(
      source
    )}`
  )
}

/** @type {(target: string | resolve_url | any) => resolve_url} */
const Target = target => {
  switch (typeof target) {
    case 'string': {
      const target_url = new URL(target)
      const { protocol, hostname, port } = target_url

      /** @type {resolve_url} */
      const resolve_url = url => {
        const result = new URL(url)

        result.protocol = protocol
        result.hostname = hostname
        result.port = port

        return result
      }

      return resolve_url
    }

    case 'function':
      return target
  }

  throw new Error(
    `[from_url_map] arguments have to be of type \`[string | RegExp, string | resolve_url]\`. unsupported target: ${JSON.stringify(
      target
    )}`
  )
}

/**
 * creates a url resolver from user-friendly options
 *
 * takes an array of key-value pairs via varargs to use as a source-to-target mapping.
 *
 * example:
 * ```
 * from_url_map(
 *  [
 *    '/simple/string/source',
 *    'https://simple-string.target'
 *  ],
 *  [
 *    /^(\/complex|\/regular)\/expression/source$/,
 *    (server_options, url, request) => {
 *      url.hostname = 'http://manually-modified.target'; return url
 *     }
 *  ],
 * )
 * ```
 *
 * - string sources are converted to the equivalent of `^<source-here>.*i` (`^\/simple\/string\/source.*`)
 * - string targets are converted to the equivalent of `<string target host><request url path>` (`https://simple-string.target/whichever-path/was/requested`). important: only the host of specified string targets are used, changing path is only supported with function options.
 * - custom regular expressions & url resolvers can be used when basic functionality is insufficient.
 *
 * @type {(...url_map: [string | RegExp, string | resolve_url][]) => resolve_url}
 */
export const from_url_map = (...url_map) => {
  /** @type {[RegExp, resolve_url][]} */
  const internal_url_map = []

  for (const entry of url_map) {
    const [source, target] = entry

    /** @type {[RegExp, resolve_url]} */
    const internal_entry = [Source(source), Target(target)]

    internal_url_map.push(internal_entry)
  }

  /**  @type {resolve_url} */
  const resolve_url = (url, request) => {
    for (const [source, resolve_url] of internal_url_map) {
      if (source.test(url.pathname)) {
        return resolve_url(url, request)
      }
    }

    throw new Error(`[resolve_url] no source for \`${url.pathname}\``)
  }

  return resolve_url
}
