import fetch from 'isomorphic-fetch'
import { expect, test, beforeAll, describe } from 'vitest'
import server from '../src/lib/server.mjs'
import { from_url_map } from '../src/lib/server/from_url_map.mjs'

beforeAll(() => {
  server({
    resolve_url: from_url_map(['/', 'https://jsonplaceholder.typicode.com']),
  })
})

describe('server', () => {
  test('gets from jsonplaceholder', async () => {
    const response = await fetch('http://127.0.0.1:8008/posts')

    expect(response.status).toBe(200)

    const json = await response.json()

    expect(json).toHaveLength(100)
  })

  test('posts to jsonplaceholder', async () => {
    const response = await fetch('http://127.0.0.1:8008/posts', {
      method: 'post',
    })

    expect(response.status).toBe(200)

    const json = await response.json()

    expect(json).toHaveProperty('id', 101)
  })
})
