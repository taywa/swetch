import { Request as Fetch_Request } from 'node-fetch'

/** @type {(input: URL | import('node-fetch').RequestInfo, init?: import('node-fetch').RequestInit) => Request} */
export const Request = (...variable_arguments) =>
  /** @type {Request} */ (
    /** @type {unknown} */ (new Fetch_Request(...variable_arguments))
  )
