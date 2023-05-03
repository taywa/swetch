import Koa from 'koa'
import koaBodyparser from 'koa-bodyparser'
import fs from 'node:fs/promises'
import os from 'node:os'
import path, { extname } from 'node:path'
import fetch from 'node-fetch'
import mime from 'mime-types'
import { Request } from 'node-fetch'

/** @type {(request: any) => Request} */
const as_request = request =>
  /** @type {Request} */ (/** @type {unknown} */ (request))

/** @type {(options: options) => Koa} */
const server = options => {
  const { port, dataDirectory, resolve_url, resolve_file_path } = options

  const dataRoot = path.join(process.cwd(), dataDirectory)

  const koa = new Koa()

  koa
    .use(async (ctx, next) => {
      try {
        await next()
      } catch (/** @type {any} */ error) {
        const { status = 500, message } = error

        /** @type {any} */
        const details = {}

        if (ctx.request.body) {
          details.requestBody = ctx.request.body
        }

        ctx.status = status
        ctx.body = {
          message: message,
          details: Object.keys(details).length ? details : undefined,
        }

        console.trace(`${status}: ${message}`, details)
      }
    })
    .use(koaBodyparser())
    .use(async (ctx, next) => {
      await next()

      const request_method = ctx.request.method.toUpperCase()

      // respond to options & head requests
      if (request_method === 'OPTIONS' || request_method === 'HEAD') {
        ctx.body = undefined
        return
      }

      // start resolving
      const target_url = resolve_url(
        new URL(ctx.URL),
        as_request({
          method: ctx.method,
          body: ctx.request.rawBody,
          json: () => JSON.parse(ctx.request.rawBody),
        })
      )

      if (target_url.origin === ctx.URL.origin) {
        throw {
          message: `url cannot resolve to this server (${target_url.origin}). make sure the \`resolve_url\` option resolves \`${target_url.pathname}\` to a different origin.`,
          status: 400,
        }
      }

      // TODO:; read from config via function
      const record = true

      let response_data

      const relative_file_path = await resolve_file_path(
        ctx.URL,
        as_request({
          method: ctx.method,
          body: ctx.request.rawBody,
          json: () => JSON.parse(ctx.request.rawBody),
        })
      )

      // TODO: handle requests to index (`/`)
      const file_path = path.join(options.dataDirectory, relative_file_path)

      // make request & write file
      if (record) {
        const { rawBody, headers } = ctx.request

        const response = await fetch(target_url, {
          method: request_method,
          body: rawBody,
          headers,
        })
        const array_buffer = await response.arrayBuffer()
        const buffer = Buffer.from(array_buffer)

        const extension = headers['content-type']
          ? mime.extension(headers['content-type']) || ''
          : ''

        // create necessary folders if required
        try {
          const file_dirname = path.dirname(file_path)
          await fs.mkdir(file_dirname, { recursive: true })
        } catch {}

        try {
          await fs.writeFile(file_path, buffer)

          // TODO: recorded vs updated
          console.info(`recorded ${relative_file_path}`)
        } catch (/** @type {any} */ error) {
          throw {
            message: `unable to write \`${file_path}\`: ${error.message}`,
            status: 500,
          }
        }

        response_data = buffer

        // read from file
      } else {
        try {
          const buffer = await fs.readFile(file_path)

          response_data = buffer
        } catch {
          throw {
            message: `no data`,
            status: 404,
          }
        }
      }

      ctx.body = response_data
      const content_type = mime.contentType(extname(file_path))
      if (typeof content_type === 'string') {
        ctx.set('Content-Type', content_type)
      }
    })

  koa.listen(port)

  console.info(`http://${os.hostname()}:${port}`)
  console.info(dataRoot)

  return koa
}

export default server
