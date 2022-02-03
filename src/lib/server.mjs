import Koa from 'koa'
import koaBodyparser from 'koa-bodyparser'
import fetch from 'node-fetch'
import crypto from 'crypto'
import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import { mergeConfig } from './utilities.mjs'

const getLogger = requestHash => {
  const shortHash = requestHash.substring(0, 8)

  return Object.fromEntries(
    ['info', 'warn', 'error'].map(method => [
      method,
      (...consoleArguments) => console[method](shortHash, ...consoleArguments),
    ])
  )
}

const serializeResponse = async ({ ignoreHeaders }, response) => {
  const headers = Object.fromEntries(response.headers.entries())

  for (const headerName of ignoreHeaders) {
    delete headers[headerName]
  }

  return JSON.stringify(
    {
      headers,
      body: await response.text(),
    },
    null,
    2
  )
}

const respond = (_, ctx, data, errors) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Access-Control-Allow-Methods', '*')
  ctx.set('Access-Control-Allow-Headers', '*')

  const dateString = new Date().toUTCString()
  ctx.set('Date', dateString)
  ctx.set('Expires', dateString)
  ctx.set('Age', '0')

  if (errors) {
    ctx.body = {
      errors,
    }
    return
  }

  if (!data) {
    return
  }

  const { headers = {}, body } = JSON.parse(data)

  for (const [header, value] of Object.entries(headers)) {
    ctx.set(header, value)
  }

  ctx.body = body
}

const getRequestHash = (resource, init) => {
  const requestString = `${resource}${JSON.stringify(init)}`

  const requestHash = crypto
    .createHash('sha1')
    .update(requestString)
    .digest('hex')

  return requestHash
}

const getRelativeResourceDirectory = resource => {
  const fromPath = resource.replace(/^https?:\/\/[^/]+/, '')
  const onlyPath = fromPath.replace(/\?.*/, '')

  return onlyPath
}

const defaultServerConfig = {
  port: 8008,
  dataDirectory: '.swetch',
  ignoreHeaders: ['date', 'expires', 'age', 'content-encoding'],
  getRequestHash,
  getRelativeResourceDirectory,
  serializeResponse,
  respond,
}

const server = config => {
  const runtimeConfig = mergeConfig(defaultServerConfig, config)
  const {
    port,
    dataDirectory,
    getRequestHash,
    getRelativeResourceDirectory,
    serializeResponse,
    respond,
  } = runtimeConfig

  const dataRoot = path.join(process.cwd(), dataDirectory)
  const getResourceDirectory = (resource, request) =>
    path.join(dataRoot, getRelativeResourceDirectory(resource, request))

  const koa = new Koa()

  koa.use(koaBodyparser())
  koa.use(async (ctx, next) => {
    await next()

    if (ctx.request.method.toUpperCase() === 'OPTIONS') {
      return respond(runtimeConfig, ctx)
    }

    const { resource, init, record, origin: swetchOrigin } = ctx.request.body
    const { origin, host } = ctx.request.headers

    const absoluteResource = /^https?:\/\//.test(resource)
      ? resource
      : `${swetchOrigin || origin || `http://${host}`}${resource}`

    const requestDirectory = getResourceDirectory(absoluteResource, init)
    const requestHash = getRequestHash(absoluteResource, init)
    const requestDataFilePath = `${path.join(
      requestDirectory,
      requestHash
    )}.json`

    const logger = getLogger(requestHash)

    try {
      if (!resource) {
        throw {
          message: `missing resource: '${resource}'`,
          status: 400,
        }
      }
      if (!init) {
        throw {
          message: `missing init: '${resource}'`,
          status: 400,
        }
      }

      logger.info(
        `${record ? 'recording ' : ''}${
          init.method || 'get'
        } ${absoluteResource}`
      )

      if (record) {
        try {
          await fs.mkdir(requestDirectory, { recursive: true })
        } catch {}

        const response = await fetch(absoluteResource, init)

        const data = await serializeResponse(runtimeConfig, response)

        try {
          await fs.writeFile(requestDataFilePath, data)
        } catch (error) {
          logger.error(`unable to write`, error)
        }

        return respond(runtimeConfig, ctx, data)
      }

      try {
        const data = await fs.readFile(requestDataFilePath)

        return respond(runtimeConfig, ctx, data)
      } catch {
        throw {
          message: `no data`,
          status: 404,
        }
      }
    } catch (error) {
      logger.warn(error.message)

      ctx.status = error.status ?? 500

      return respond(runtimeConfig, ctx, null, [
        {
          message: error.message,
          details: { requestBody: ctx.request.body },
        },
      ])
    }
  })

  koa.listen(port)

  console.info(`http://${os.hostname()}:${port}`)
  console.info(dataRoot)
}

export default server
