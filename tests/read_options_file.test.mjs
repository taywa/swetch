import { expect, test, describe } from 'vitest'
import { read_options_file } from '../src/lib/server/read_options_file.mjs'

describe('read_options_file', () => {
  test('reads from named export', async () => {
    const options = await read_options_file(
      'tests/fixtures/swetch.config.named_export.mjs'
    )

    // set same function to make comparison work
    expect(options).toEqual({
      resolve_url: options.resolve_url,

      dataDirectory: 'mock_data',
    })
  })

  test('reads from default export', async () => {
    const options = await read_options_file(
      'tests/fixtures/swetch.config.default_export.mjs'
    )

    // set same function to make comparison work
    expect(options).toEqual({
      resolve_url: options.resolve_url,
      dataDirectory: 'mock_data',
    })
  })

  test('throws error on missing exports', async () => {
    await expect(async () => {
      await read_options_file('tests/fixtures/swetch.config.missing:export.mjs')
    }).rejects.toThrowError(
      new Error(
        'missing export in `tests/fixtures/swetch.config.missing:export.mjs`. add a named (`export const options = {}`) or default (`export default {}`) export to the file.'
      )
    )
  })

  test('throws error on missing resolve_url option', async () => {
    await expect(async () => {
      await read_options_file(
        'tests/fixtures/swetch.config.missing:resolve_url.mjs'
      )
    }).rejects.toThrowError(
      new Error(
        'missing `resolve_url` option in `tests/fixtures/swetch.config.missing:resolve_url.mjs`. add a property called `resolve_url` of type function to its export.'
      )
    )
  })
})
