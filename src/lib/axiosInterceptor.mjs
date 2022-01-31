import {
  defaultSwetchConfig,
  getBrowserOrigin,
  mergeConfig,
} from './utilities.mjs'

const axiosInterceptor = config => {
  const { server, record, origin } = mergeConfig(defaultSwetchConfig, config)

  return config => {
    const data = {
      origin: origin || getBrowserOrigin(),
      resource: config.url,
      init: {
        headers: config.headers.common || config.headers,
        method: config.method,
      },
      record,
    }

    const overrides = {
      url: server,
      method: 'post',
      data,
    }

    Object.assign(config, overrides)

    return {
      ...config,
      ...overrides,
    }
  }
}

export default axiosInterceptor
