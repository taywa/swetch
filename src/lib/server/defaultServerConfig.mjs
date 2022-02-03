import getRequestHash from './getRequestHash.mjs'
import getRelativeResourceDirectory from './getRelativeResourceDirectory.mjs'
import serializeResponse from './serializeResponse.mjs'
import respond from './respond.mjs'

const defaultServerConfig = {
  port: 8008,
  dataDirectory: '.swetch',
  ignoreHeaders: ['date', 'expires', 'age', 'content-encoding'],
  getRequestHash,
  getRelativeResourceDirectory,
  serializeResponse,
  respond,
}

export default defaultServerConfig
