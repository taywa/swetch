/** @type {(default_options: options, user_optios: Partial<options>) => options} */
export const mergeConfig = (defaultConfig, config = {}) =>
  Object.fromEntries(
    Object.entries(defaultConfig).map(([key]) => [
      key,
      config[key] ?? defaultConfig[key],
    ])
  )

export const getBrowserOrigin = () =>
  typeof location === 'undefined' ? undefined : location.origin
