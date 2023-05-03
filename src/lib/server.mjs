import Koa from 'koa'
import koaBodyparser from 'koa-bodyparser'
import fs from 'node:fs/promises'
import os from 'node:os'
import path, { extname } from 'node:path'
import fetch from 'node-fetch'
import mime from 'mime-types'

import { mergeConfig } from './utilities.mjs'
import defaultServerConfig from './server/defaultServerConfig.mjs'

/** @type {(request: any) => Request} */
const as_request = request =>
  /** @type {Request} */ (/** @type {unknown} */ (request))

/** @type {(user_options?: Partial<options>) => Koa} */
const server = config => {
  const runtimeConfig = mergeConfig(defaultServerConfig, config ?? {})
  const { port, dataDirectory, respond, resolve_url, resolve_file_path } =
    runtimeConfig

  const dataRoot = path.join(process.cwd(), dataDirectory)

  const koa = new Koa()

  koa
    .use(koaBodyparser())
    .use(async (ctx, next) => {
      try {
        await next()
      } catch (/** @type {any} */ error) {
        ctx.status = error.status ?? 500

        ctx.body = {
          message: error.message,
          details: { requestBody: ctx.request.body },
        }
      }
    })
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
        runtimeConfig,
        new URL(ctx.URL),
        as_request(ctx.req)
      )

      if (target_url.origin === ctx.URL.origin) {
        throw {
          message: `url cannot resolve to this server (${target_url.origin}). make sure the \`resolve_url\` option resolves \`${target_url.pathname}\` to a different origin.`,
          status: 400,
        }
      }

      const relative_file_path = await resolve_file_path(
        runtimeConfig,
        ctx.URL,
        as_request(ctx.req)
      )
      const file_path = path.join(
        runtimeConfig.dataDirectory,
        relative_file_path
      )

      const record = true

      let response_data

      // make request & write file
      if (record) {
        // create necessary folders if required
        try {
          const directory = path.dirname(file_path)
          await fs.mkdir(directory, { recursive: true })
        } catch {}

        const response = await fetch(target_url, { method: request_method })
        const array_buffer = await response.arrayBuffer()
        const buffer = Buffer.from(array_buffer)

        try {
          await fs.writeFile(file_path, buffer)

          console.info(`wrote ${request_method} ${relative_file_path}`)
        } catch (error) {
          throw {
            message: 'unable to write',
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
