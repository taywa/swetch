#!/usr/bin/env node

import server from '../lib/server.mjs'

const argvMap = Object.fromEntries(
  [...process.argv.entries()].map(entry => entry.reverse())
)

const port = process.argv[(argvMap['--port'] || argvMap['-p']) + 1]
const dataDirectory =
  process.argv[(argvMap['--data-directory'] || argvMap['-d']) + 1]
const ignoreHeadersArg =
  process.argv[(argvMap['--ignore-headers'] || argvMap['-i']) + 1]
const ignoreHeaders = ignoreHeadersArg && ignoreHeadersArg.split(',')

server({ port, dataDirectory, ignoreHeaders })
