import { defaultSwetchConfig } from './swetch.mjs'
import { mergeConfig } from './utilities.mjs'

const axiosInterceptor = config => {
  const { server, record } = mergeConfig(defaultSwetchConfig, config)

  return config => {
    const data = {
      resource: config.url,
      init: {
        headers: config.headers.common || config.headers,
        method: config.method,
      },
      record,
    }

    config.url = server
    config.method = 'post'
    config.data = data
  }
}

export default axiosInterceptor
