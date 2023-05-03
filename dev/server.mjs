import server from '../src/lib/server.mjs'

server({
  resolve_url: () => new URL('https://jsonplaceholder.typicode.com'),
})
