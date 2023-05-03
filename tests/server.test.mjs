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
      ['/graphql/v1beta', 'https://beta.pokeapi.co']
    ),
  })
})

describe(
  'server',
  () => {
    test('gets from jsonplaceholder', async () => {
      const response = await fetch('http://127.0.0.1:8009/posts')
      const text = await response.text()

      expect(response.status, `non-200 status: \`${text}\``).toStrictEqual(200)
      expect(response.headers.get('Content-Type')).toEqual(
        'application/json; charset=utf-8'
      )

      const json = JSON.parse(text)

      expect(json).toHaveLength(100)
    })

    test('posts to jsonplaceholder', async () => {
      const response = await fetch('http://127.0.0.1:8009/posts', {
        method: 'post',
      })
      const text = await response.text()

      expect(response.status, `non-200 status: \`${text}\``).toStrictEqual(200)
      expect(response.headers.get('Content-Type')).toEqual(
        'application/json; charset=utf-8'
      )

      const json = JSON.parse(text)

      expect(json).toHaveProperty('id', 101)
    })

    test(
      'queries graphql from pokéapi',
      async () => {
        const response = await fetch('http://127.0.0.1:8009/graphql/v1beta', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            operationName: 'generations',
            variables: null,
            query: `query generations {
            pokemon_v2_generation(limit: 3) {
              name
              pokemon_v2_region {
                name
              }
            }
          }`,
          }),
        })
        const text = await response.text()

        expect(response.status, `non-200 status: \`${text}\``).toStrictEqual(
          200
        )
        expect(response.headers.get('Content-Type')).toEqual(
          'application/json; charset=utf-8'
        )

        const json = JSON.parse(text)

        expect(json).toEqual({
          data: {
            pokemon_v2_generation: [
              {
                name: 'generation-i',
                pokemon_v2_region: {
                  name: 'kanto',
                },
              },
              {
                name: 'generation-ii',
                pokemon_v2_region: {
                  name: 'johto',
                },
              },
              {
                name: 'generation-iii',
                pokemon_v2_region: {
                  name: 'hoenn',
                },
              },
            ],
          },
        })
      },
      { timeout: 8000, retry: 3 }
    )
  },
  { timeout: 2000, retry: 3 }
)
