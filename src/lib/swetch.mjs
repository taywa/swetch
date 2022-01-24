import fetch from 'isomorphic-fetch'
import { mergeConfig } from './utilities.mjs'

export const defaultSwetchConfig = {
  server: 'http://localhost:8008',
  record: false,
}

const swetch = config => {
  const { server, record } = mergeConfig(defaultSwetchConfig, config)

  return async (resource, init = {}) => {
    const { signal, ...relevantInit } = init

    const result = await fetch(server, {
      signal,
      body: JSON.stringify({
        resource,
        init: relevantInit,
        record,
        origin: typeof location === 'undefined' ? undefined : location.hostname,
      }),
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return result
  }
}

export default swetch
