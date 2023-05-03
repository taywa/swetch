import { resolve_file_path } from './resolve_file_path.mjs'

/** @type {Omit<options, 'resolve_url'>} */
const defaultServerConfig = {
  port: 8008,
  dataDirectory: '.swetch',
  resolve_file_path,
}

export default defaultServerConfig
