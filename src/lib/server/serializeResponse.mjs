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

export default serializeResponse
