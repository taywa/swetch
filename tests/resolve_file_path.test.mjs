import { expect, test, describe } from 'vitest'

import { resolve_file_path } from '../src/lib/server/resolve_file_path.mjs'
import defaultServerConfig from '../src/lib/server/defaultServerConfig.mjs'
import { Request } from './utilities.mjs'

describe('resolve_file_path', () => {
  describe('resolves file', () => {
    test('get request', async () => {
      const url = new URL('https://test.domain.tld/path/to/file.ext')
      const request = Request(url)

      const file_path = await resolve_file_path(
        defaultServerConfig,
        url,
        request
      )

      expect(file_path).toBe('/path/to/file.ext')
    })

    test('post request with body & parameters', async () => {
      const url = new URL(
        'https://test.domain.tld/path/to/file.post.ext?parameter=value'
      )
      const request = Request(url, {
        method: 'post',
        body: JSON.stringify({ another: 1 }),
      })

      const file_path = await resolve_file_path(
        defaultServerConfig,
        url,
        request
      )

      expect(file_path).toBe(
        '/path/to/file.post.another:1|parameter:"value".ext'
      )
    })

    test('get request with multiple dots & parameters', async () => {
      const url = new URL(
        'https://test.domain.tld/path/to/file.something.else.ext?parameter=value'
      )
      const request = Request(url)

      const file_path = await resolve_file_path(
        defaultServerConfig,
        url,
        request
      )

      expect(file_path).toBe(
        '/path/to/file.something.else.parameter:"value".ext'
      )
    })
  })

  describe('resolves rest', () => {
    test('get request', async () => {
      const url = new URL('https://test.domain.tld/path/to/rest')
      const request = Request(url)

      const file_path = await resolve_file_path(
        defaultServerConfig,
        url,
        request
      )

      expect(file_path).toBe('/path/to/rest.get.json')
    })

    test('get request with parameters', async () => {
      const url = new URL(
        'https://test.domain.tld/path/to/rest/?parameter=value&another=1'
      )
      const request = Request(url)

      const file_path = await resolve_file_path(
        defaultServerConfig,
        url,
        request
      )

      expect(file_path).toBe(
        '/path/to/rest.get.another:"1"|parameter:"value".json'
      )
    })

    test('rest post request with parameters', async () => {
      const url = new URL('https://test.domain.tld/path/to/rest/')
      const request = Request(url, {
        method: 'post',
        body: JSON.stringify({ parameter: 'value', another: 1 }),
      })

      const file_path = await resolve_file_path(
        defaultServerConfig,
        url,
        request
      )

      expect(file_path).toBe(
        '/path/to/rest.post.another:1|parameter:"value".json'
      )
    })

    test('rest post request with parameters url and body', async () => {
      const url = new URL(
        'https://test.domain.tld/path/to/rest?parameter=value'
      )
      const request = Request(url, {
        method: 'post',
        body: JSON.stringify({ another: 1 }),
      })

      const file_path = await resolve_file_path(
        defaultServerConfig,
        url,
        request
      )

      expect(file_path).toBe(
        '/path/to/rest.post.another:1|parameter:"value".json'
      )
    })
  })

  describe('resolves graphql', () => {
    test('query', async () => {
      const url = new URL('https://test.domain.tld/graphql')
      const request = Request(url, {
        method: 'post',
        body: JSON.stringify({
          operationName: 'graphqlQuery',
          query: `{graphqlQuery{id}}`,
          variables: {},
        }),
      })

      const file_path = await resolve_file_path(
        defaultServerConfig,
        url,
        request
      )

      expect(file_path).toBe('/graphql/graphqlQuery.json')
    })

    test('query with variables', async () => {
      const url = new URL('https://test.domain.tld/graphql')
      const request = Request(url, {
        method: 'post',
        body: JSON.stringify({
          operationName: 'graphqlQuery',
          query: `{graphqlQuery($variable: String, $another: Int){id}}`,
          variables: {
            variable: 'value',
            another: 1,
          },
        }),
      })

      const file_path = await resolve_file_path(
        defaultServerConfig,
        url,
        request
      )

      expect(file_path).toBe(
        '/graphql/graphqlQuery.another:1|variable:"value".json'
      )
    })
  })
})
