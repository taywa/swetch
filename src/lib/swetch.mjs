import fetch from 'isomorphic-fetch'
import {
  defaultSwetchConfig,
  getBrowserOrigin,
  mergeConfig,
} from './utilities.mjs'

const swetch = config => {
  const { server, record, origin } = mergeConfig(defaultSwetchConfig, config)

  return async (resource, init = {}) => {
    const { signal, ...relevantInit } = init

    const result = await fetch(server, {
      signal,
      body: JSON.stringify({
        origin: origin || getBrowserOrigin(),
        resource,
        init: relevantInit,
        record,
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
