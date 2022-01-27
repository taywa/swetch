export const mergeConfig = (defaultConfig, config = {}) =>
  Object.fromEntries(
    Object.entries(defaultConfig).map(([key]) => [
      key,
      config[key] ?? defaultConfig[key],
    ])
  )

export const getBrowserOrigin = () =>
  typeof location === 'undefined' ? undefined : location.origin
