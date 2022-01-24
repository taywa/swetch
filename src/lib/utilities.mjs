export const mergeConfig = (defaultConfig, config = {}) => ({
  ...defaultConfig,
  ...config,
})
