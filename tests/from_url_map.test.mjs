import { expect, test, describe } from 'vitest'
import { from_url_map } from '../src/lib/server/from_url_map.mjs'
import { Request } from './utilities.mjs'

describe('from_url_map creates resolver', () => {
  test('which ignores string target paths', () => {
    const resolve_url = from_url_map(['/', 'https://other.host/ignored/path'])

    const path_url = new URL('http://127.0.0.1:8008/rest/api')
    expect(resolve_url(path_url, Request(path_url))).toStrictEqual(
      new URL('https://other.host/rest/api')
    )

    const index_url = new URL('http://127.0.0.1:8008')
    expect(resolve_url(index_url, Request(index_url))).toStrictEqual(
      new URL('https://other.host')
    )
  })

  test('with string sources & targets', () => {
    const resolve_url = from_url_map(
      ['/rest', 'https://other.host/ignored/path'],
      ['/graphql', 'https://graphql.host/ignored/path']
    )

    const rest_url = new URL('http://127.0.0.1:8008/rest/api')
    expect(resolve_url(rest_url, Request(rest_url))).toStrictEqual(
      new URL('https://other.host/rest/api')
    )

    const graphql_url = new URL('http://127.0.0.1:8008/graphql')
    expect(resolve_url(graphql_url, Request(graphql_url))).toStrictEqual(
      new URL('https://graphql.host/graphql')
    )
  })

  test('with regex sources & string targets', () => {
    const resolve_url = from_url_map(
      [/^\/everything-after$/, 'https://exacty.everything.after'],
      [/^\/everything-after.*/, 'http://everything.after']
    )

    const exact_url = new URL('http://127.0.0.1:8008/everything-after')
    expect(resolve_url(exact_url, Request(exact_url))).toStrictEqual(
      new URL('https://exacty.everything.after/everything-after')
    )

    const wildcard_url = new URL(
      'http://127.0.0.1:8008/everything-after/allowed'
    )
    expect(resolve_url(wildcard_url, Request(wildcard_url))).toStrictEqual(
      new URL('http://everything.after/everything-after/allowed')
    )
  })

  test('with regex sources & function targets', () => {
    const resolve_url = from_url_map(
      [/^\/everything-after$/, 'https://exacty.everything.after'],
      [/^\/everything-after.*/, 'http://everything.after']
    )

    const exact_url = new URL('http://127.0.0.1:8008/everything-after')
    expect(resolve_url(exact_url, Request(exact_url))).toStrictEqual(
      new URL('https://exacty.everything.after/everything-after')
    )

    const wildcard_url = new URL(
      'http://127.0.0.1:8008/everything-after/allowed'
    )
    expect(resolve_url(wildcard_url, Request(wildcard_url))).toStrictEqual(
      new URL('http://everything.after/everything-after/allowed')
    )
  })

  test('which throws an error for unknown paths', () => {
    // without any entries
    const resolve_url_from_empty_map = from_url_map()

    const url = new URL('http://127.0.0.1:8008')
    expect(() => {
      resolve_url_from_empty_map(url, Request(url))
    }).toThrowError(new Error('[resolve_url] no source for `/`'))

    // with entries
    const resolve_url = from_url_map(['/un-used', 'http://never.used'])

    expect(() => {
      resolve_url(url, Request(url))
    }).toThrowError(new Error('[resolve_url] no source for `/`'))
  })
})
