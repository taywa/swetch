import { resolve_file_path } from './resolve_file_path.mjs'

/** @type {Omit<options, 'resolve_url'>} */
export const default_options = {
  port: 8008,
  dataDirectory: '.swetch',
  resolve_file_path,
}
