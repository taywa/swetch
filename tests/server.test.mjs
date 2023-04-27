import fetch from 'isomorphic-fetch'
import { expect, test, beforeAll } from 'vitest'
import server from '../src/lib/server.mjs'

beforeAll(() => {
  server({
    resolve_url: (_, url) => {
      url.hostname = 'jsonplaceholder.typicode.com'
      url.protocol = 'https'
      url.port = ''

      return url
    },
  })
})

test('gets from jsonplaceholder', async () => {
  const response = await fetch('http://localhost:8008/posts')

  expect(response.status).toBe(200)

  const json = await response.json()

  expect(json).toHaveLength(100)
})

test('posts to jsonplaceholder', async () => {
  const response = await fetch('http://localhost:8008/posts', {
    method: 'post',
  })

  expect(response.status).toBe(200)

  const json = await response.json()

  expect(json).toHaveProperty('id', 101)
})
