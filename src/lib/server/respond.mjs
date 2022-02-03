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

export default respond
