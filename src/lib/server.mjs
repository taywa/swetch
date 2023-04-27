import Koa from 'koa'
import koaBodyparser from 'koa-bodyparser'
import fetch from 'node-fetch'
import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'

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

  koa.use(koaBodyparser())
  koa.use(async (ctx, next) => {
    await next()

    const requestMethod = ctx.request.method.toUpperCase()
    if (requestMethod === 'OPTIONS' || requestMethod === 'HEAD') {
      ctx.body = undefined
      return
    }

    const target_url = resolve_url(runtimeConfig, ctx.URL, as_request(ctx.req))
    const relative_file_path = await resolve_file_path(
      runtimeConfig,
      ctx.URL,
      as_request(ctx.req)
    )
    const file_path = path.join(runtimeConfig.dataDirectory, relative_file_path)

    const record = true

    try {
      console.info(
        `${record ? 'recording ' : ''}${
          requestMethod || 'get'
        } ${relative_file_path}`
      )

      if (record) {
        // create necessary folders if required
        try {
          const directory = path.dirname(file_path)
          await fs.mkdir(directory, { recursive: true })
        } catch {}

        const response = await fetch(target_url, { method: requestMethod })
        const array_buffer = await response.arrayBuffer()
        const buffer = Buffer.from(array_buffer)

        try {
          await fs.writeFile(file_path, buffer)
        } catch (error) {
          console.error(`unable to write`, error)
        }

        ctx.body = buffer

        return
      }

      try {
        const buffer = await fs.readFile(file_path)

        ctx.body = new Response(buffer)
        return
      } catch {
        throw {
          message: `no data`,
          status: 404,
        }
      }
    } catch (/** @type {any} */ error) {
      ctx.status = error.status ?? 500

      ctx.body = new Response(
        JSON.stringify({
          message: error.message,
          details: { requestBody: ctx.request.body },
        })
      )
    }
  })

  koa.listen(port)

  console.info(`http://${os.hostname()}:${port}`)
  console.info(dataRoot)

  return koa
}

export default server
