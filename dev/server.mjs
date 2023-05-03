import server from '../src/lib/server.mjs'
import defaultServerConfig from '../src/lib/server/defaultServerConfig.mjs'

server({
  ...defaultServerConfig,
  resolve_url: () => new URL('https://jsonplaceholder.typicode.com'),
})
