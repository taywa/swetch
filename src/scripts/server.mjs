#!/usr/bin/env node
import { existsSync } from 'node:fs'
import process from 'node:process'

import server from '../lib/server.mjs'
import { read_options_file } from '../lib/server/read_options_file.mjs'
import { merge_options } from '../lib/merge_options.mjs'
import defaultServerConfig from '../lib/server/defaultServerConfig.mjs'
import { join } from 'node:path'

/** @type {(argv: string[], ...flags: string[]) => string | undefined} */
const parse_process_argument = (argv, ...flags) => {
  for (const flag of flags) {
    const flag_index = process.argv.indexOf(flag)
    if (flag_index > 0) {
      return argv[flag_index + 1]
    }
  }
  return undefined
}

const options_file_argument = parse_process_argument(
  process.argv,
  '--config',
  '-c'
)
// TODO: bring back arguments. not sure if they're all needed

const start = async () => {
  const default_options_file_path = join(process.cwd(), 'swetch.config.mjs')
  const options_file_path = options_file_argument ?? default_options_file_path
  let user_options = {}
  if (existsSync(options_file_path)) {
    user_options = await read_options_file(options_file_path)
  }

  // typecast because default options is complete
  const options =
    /** @type {Omit<options, 'resolve_url'> & Partial<Pick<options, 'resolve_url'>>} */ (
      merge_options(defaultServerConfig, user_options)
    )

  if (!options.resolve_url) {
    throw new Error(
      "missing `resolve_url` option. make sure to add a `swetch.config.mjs` to the folder you're runnning this from or to specify the file with `--config path/to/file.mjs` (`-c` for short)."
    )
  }

  // not sure why `options.resolve_url` is still optional here
  server(/** @type {options} */ (options))
}

start()
