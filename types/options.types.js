/**
 * @typedef {{
 *  port: number
 *  dataDirectory: string
 *  ignoreHeaders: string[]
 *  getRequestHash: () => string
 *  getRelativeResourceDirectory: () => string
 *  serializeResponse: () => string | Promise<string>
 *  respond: () => void
 *  resolve_url: resolve_url
 *  resolve_file_path: (options: options, url: URL, request: Request) => string | Promise<string>
 * }} options
 */

/**
 * @typedef {Partial<options> & Pick<options, 'resolve_url'>} user_options
 */
