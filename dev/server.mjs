import server from '../src/lib/server.mjs'
import { default_options } from '../src/lib/server/default_options.mjs'

server({
  ...default_options,
  resolve_url: () => new URL('https://jsonplaceholder.typicode.com'),
})
