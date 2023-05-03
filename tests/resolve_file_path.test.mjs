import { expect, test, describe } from 'vitest'

import { resolve_file_path } from '../src/lib/server/resolve_file_path.mjs'
import { Request } from './utilities.mjs'

describe('resolve_file_path', () => {
  describe('resolves file', () => {
    test('get request', async () => {
      const url = new URL('https://test.domain.tld/path/to/file.ext')
      const request = Request(url)

      const file_path = await resolve_file_path(url, request)

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

      const file_path = await resolve_file_path(url, request)

      expect(file_path).toBe('/path/to/file.post.another:1|parameter:value.ext')
    })

    test('get request with multiple dots & parameters', async () => {
      const url = new URL(
        'https://test.domain.tld/path/to/file.something.else.ext?parameter=value'
      )
      const request = Request(url)

      const file_path = await resolve_file_path(url, request)

      expect(file_path).toBe('/path/to/file.something.else.parameter:value.ext')
    })
  })

  describe('resolves rest', () => {
    test('get request', async () => {
      const url = new URL('https://test.domain.tld/path/to/rest')
      const request = Request(url)

      const file_path = await resolve_file_path(url, request)

      expect(file_path).toBe('/path/to/rest.get.json')
    })

    test('get request with parameters', async () => {
      const url = new URL(
        'https://test.domain.tld/path/to/rest/?parameter=value&another=1'
      )
      const request = Request(url)

      const file_path = await resolve_file_path(url, request)

      expect(file_path).toBe('/path/to/rest.get.another:1|parameter:value.json')
    })

    test('rest post request with parameters', async () => {
      const url = new URL('https://test.domain.tld/path/to/rest/')
      const request = Request(url, {
        method: 'post',
        body: JSON.stringify({ parameter: 'value', another: 1 }),
      })

      const file_path = await resolve_file_path(url, request)

      expect(file_path).toBe(
        '/path/to/rest.post.another:1|parameter:value.json'
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

      const file_path = await resolve_file_path(url, request)

      expect(file_path).toBe(
        '/path/to/rest.post.another:1|parameter:value.json'
      )
    })

    test('rest post request with url-like parameters', async () => {
      const url = new URL(
        'https://test.domain.tld/path/to/rest?some_file=/escape/this'
      )
      const request = Request(url, {
        method: 'post',
        body: JSON.stringify({ another_file: '/also/this/too' }),
      })

      const file_path = await resolve_file_path(url, request)

      expect(file_path).toBe(
        '/path/to/rest.post.another_file:_also_this_too|some_file:_escape_this.json'
      )
    })
  })

  describe('resolves graphql', () => {
    test('query', async () => {
      const url = new URL('https://test.domain.tld/graphql')
      const request = Request(url, {
        method: 'post',
        body: JSON.stringify({
          query: `{__typename graphqlQuery{id}}`,
        }),
      })

      const file_path = await resolve_file_path(url, request)

      expect(file_path).toBe('/graphql/graphqlQuery.json')
    })

    test('named query with variables', async () => {
      const url = new URL('https://test.domain.tld/graphql')
      const request = Request(url, {
        method: 'post',
        body: JSON.stringify({
          query: `query namedQuery($variable: String, $another: Int){__typename graphqlQuery{id}}`,
          variables: {
            variable: 'value',
            another: 1,
          },
        }),
      })

      const file_path = await resolve_file_path(url, request)

      expect(file_path).toBe(
        '/graphql/namedQuery.another:1|variable:value.json'
      )
    })

    test('multiple queries', async () => {
      const url = new URL('https://test.domain.tld/graphql')
      const request = Request(url, {
        method: 'post',
        body: JSON.stringify({
          query: `{__typename\ngraphqlQuery{id}anotherQuery{name}}`,
        }),
      })

      const file_path = await resolve_file_path(url, request)

      expect(file_path).toBe('/graphql/graphqlQuery+anotherQuery.json')
    })

    test('named query with multiple queries & variables', async () => {
      const url = new URL('https://test.domain.tld/graphql')
      const request = Request(url, {
        method: 'post',
        body: JSON.stringify({
          query: `query namedQuery($variable: String, $another: Int){graphqlQuery{id}anotherQuery{name}}`,
          variables: {
            variable: 'value',
            another: 1,
          },
        }),
      })

      const file_path = await resolve_file_path(url, request)

      expect(file_path).toBe(
        '/graphql/namedQuery.another:1|variable:value.json'
      )
    })

    test('mutation', async () => {
      const url = new URL('https://test.domain.tld/graphql')
      const request = Request(url, {
        method: 'post',
        body: JSON.stringify({
          query: `mutation{someMutation{id}}`,
        }),
      })

      const file_path = await resolve_file_path(url, request)

      expect(file_path).toBe('/graphql/someMutation.json')
    })

    test('named mutation', async () => {
      const url = new URL('https://test.domain.tld/graphql')
      const request = Request(url, {
        method: 'post',
        body: JSON.stringify({
          query: `mutation myMutation{someMutation{id}}`,
        }),
      })

      const file_path = await resolve_file_path(url, request)

      expect(file_path).toBe('/graphql/myMutation.json')
    })

    test('query with url-like variable', async () => {
      const url = new URL('https://test.domain.tld/graphql')
      const request = Request(url, {
        method: 'post',
        body: JSON.stringify({
          query: `mutation myMutation{someMutation{id}}`,
          variables: {
            some_file: '/escape/this',
          },
        }),
      })

      const file_path = await resolve_file_path(url, request)

      expect(file_path).toBe('/graphql/myMutation.some_file:_escape_this.json')
    })
  })
})
