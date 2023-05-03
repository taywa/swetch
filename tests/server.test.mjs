import fetch from 'node-fetch'
import { expect, test, beforeAll, describe } from 'vitest'
import server from '../src/lib/server.mjs'
import { from_url_map } from '../src/lib/server/from_url_map.mjs'
import defaultServerConfig from '../src/lib/server/defaultServerConfig.mjs'

beforeAll(() => {
  server({
    ...defaultServerConfig,
    port: 8009,
    resolve_url: from_url_map(
      ['/posts', 'https://jsonplaceholder.typicode.com'],
      ['/v2/c4d7a195/graphql', 'https://api.mocki.io']
    ),
  })
})

describe('server', () => {
  test('gets from jsonplaceholder', async () => {
    const response = await fetch('http://127.0.0.1:8009/posts')

    expect(
      response.status,
      `non-200 status: \`${await response.text()}\``
    ).toStrictEqual(200)
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8'
    )

    const json = await response.json()

    expect(json).toHaveLength(100)
  })

  test('posts to jsonplaceholder', async () => {
    const response = await fetch('http://127.0.0.1:8009/posts', {
      method: 'post',
    })

    expect(
      response.status,
      `non-200 status: \`${await response.text()}\``
    ).toStrictEqual(200)
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8'
    )

    const json = await response.json()

    expect(json).toHaveProperty('id', 101)
  })

  test('queries graphql from mockio', async () => {
    const response = await fetch('http://127.0.0.1:8009/v2/c4d7a195/graphql', {
      method: 'post',
      body: JSON.stringify({
        query: `{
          users {
            id
            name
            email
          }
          todos {
            id
            description
            done
          }
        }`,
      }),
    })

    expect(
      response.status,
      `non-200 status: \`${await response.text()}\``
    ).toStrictEqual(200)
    expect(response.headers.get('Content-Type')).toEqual(
      'application/json; charset=utf-8'
    )

    const json = await response.json()

    expect(json).toEqual({
      data: {
        users: [
          {
            id: 'Hello World',
            name: 'Hello World',
            email: 'Hello World',
          },
          {
            id: 'Hello World',
            name: 'Hello World',
            email: 'Hello World',
          },
        ],
        todos: [
          {
            id: 'Hello World',
            description: 'Hello World',
            done: false,
          },
          {
            id: 'Hello World',
            description: 'Hello World',
            done: false,
          },
        ],
      },
    })
  })
})
