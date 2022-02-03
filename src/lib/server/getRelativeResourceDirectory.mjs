const getRelativeResourceDirectory = resource => {
  const fromPath = resource.replace(/^https?:\/\/[^/]+/, '')
  const onlyPath = fromPath.replace(/\?.*/, '')

  return onlyPath
}

export default getRelativeResourceDirectory
