/**
 * @typedef {{
 *  port: number
 *  dataDirectory: string
 *  ignoreHeaders: string[]
 *  getRequestHash: () => string
 *  getRelativeResourceDirectory: () => string
 *  serializeResponse: () => string | Promise<string>
 *  respond: () => void
 *  resolve_url: (options: options, url: URL, request: Request) => URL
 *  resolve_file_path: (options: options, url: URL, request: Request) => string | Promise<string>
 * }} options
 */
