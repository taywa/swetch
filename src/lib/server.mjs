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

const serializeResponse = async response =>
  JSON.stringify({
    headers: Object.fromEntries(response.headers.entries()),
    body: await response.text(),
  })

const respond = (ctx, headers, body, status) => {
  const { 'content-encoding': contentEncoding, ...relevantHeaders } = headers

  for (const [header, value] of Object.entries(relevantHeaders)) {
    ctx.set(header, value)
  }

  ctx.body = body
  ctx.status = status ?? ctx.status
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
  getRequestHash,
  getRelativeResourceDirectory,
}

const server = config => {
  const { port, dataDirectory, getRequestHash, getRelativeResourceDirectory } =
    mergeConfig(defaultServerConfig, config)

  const dataRoot = path.join(process.cwd(), dataDirectory)
  const getResourceDirectory = (resource, request) =>
    path.join(dataRoot, getRelativeResourceDirectory(resource, request))

  const koa = new Koa()

  koa.use(koaBodyparser())
  koa.use(async (ctx, next) => {
    await next()

    const { resource, init, record, origin: swetchOrigin } = ctx.request.body
    const { origin, host } = ctx.request.headers

    const absoluteResource = /^https?:\/\//.test(resource)
      ? resource
      : `${origin || swetchOrigin || `http://${host}`}${resource}`

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
        const response = await fetch(absoluteResource, init)
        const clone = response.clone()

        const headers = Object.fromEntries(clone.headers.entries())
        const body = await clone.text()

        try {
          await fs.mkdir(requestDirectory, { recursive: true })
        } catch {}

        try {
          await fs.writeFile(
            requestDataFilePath,
            await serializeResponse(response)
          )
        } catch (error) {
          logger.error(`no data written:`, error)
        }

        return respond(ctx, headers, body)
      }

      try {
        const fileContent = await fs.readFile(requestDataFilePath)
        const { headers, body } = JSON.parse(fileContent)

        return respond(ctx, headers, body)
      } catch {
        throw {
          message: `no data`,
          status: 404,
        }
      }
    } catch (error) {
      logger.warn(error.message)

      return respond(
        ctx,
        { 'Content-Type': 'application/json' },
        {
          errors: [
            {
              message: error.message,
              details: { requestBody: ctx.request.body },
            },
          ],
        },
        error.status ?? 500
      )
    }
  })

  koa.listen(port)

  console.info(`http://${os.hostname()}:${port}`)
  console.info(dataRoot)
}

export default server
