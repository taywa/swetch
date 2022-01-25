export const mergeConfig = (defaultConfig, config = {}) =>
  Object.fromEntries(
    Object.entries(defaultConfig).map(([key]) => [
      key,
      config[key] ?? defaultConfig[key],
    ])
  )
