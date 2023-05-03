/**
 * @typedef {{
 *  port: number
 *  dataDirectory: string
 *  resolve_url: resolve_url
 *  resolve_file_path: (url: URL, request: Request) => string | Promise<string>
 * }} options
 */

/**
 * @typedef {Partial<options> & Pick<options, 'resolve_url'>} user_options
 */
