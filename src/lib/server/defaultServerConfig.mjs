import getRequestHash from './getRequestHash.mjs'
import getRelativeResourceDirectory from './getRelativeResourceDirectory.mjs'
import serializeResponse from './serializeResponse.mjs'
import respond from './respond.mjs'
import { resolve_file_path } from './resolve_file_path.mjs'

/** @type {options} */
const defaultServerConfig = {
  port: 8008,
  dataDirectory: '.swetch',
  ignoreHeaders: ['date', 'expires', 'age', 'content-encoding'],
  getRequestHash,
  getRelativeResourceDirectory,
  serializeResponse,
  respond,
  resolve_url: (_, url) => url,
  resolve_file_path,
}

export default defaultServerConfig
