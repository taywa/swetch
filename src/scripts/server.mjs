import server from '../lib/server.mjs'

const argvMap = Object.fromEntries(
  [...process.argv.entries()].map(entry => entry.reverse())
)

const port = process.argv[(argvMap['--port'] || argvMap['-p']) + 1]
const dataDirectory =
  process.argv[(argvMap['--data-directory'] || argvMap['-d']) + 1]

server({ port, dataDirectory })
