import crypto from 'crypto'

const getRequestHash = (resource, init) => {
  const requestString = `${resource}${JSON.stringify(init)}`

  const requestHash = crypto
    .createHash('sha1')
    .update(requestString)
    .digest('hex')

  return requestHash
}

export default getRequestHash
