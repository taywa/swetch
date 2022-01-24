import { swetch } from '../lib/index.mjs'

const doRecord = !!process.env.RECORD
if (doRecord) {
  console.info('Recording')
}

const fetch = swetch({
  record: doRecord,
})

const testFetches = [
  ['https://jsonplaceholder.typicode.com/posts'],
  ['https://jsonplaceholder.typicode.com/posts?userId=1'],
]

setTimeout(async () => {
  const results = await Promise.all(
    testFetches.map(fetchArguments => fetch(...fetchArguments))
  )

  console.debug(
    await Promise.all(
      results.map(async response => [response.status, await response.text()])
    )
  )
}, 1000)
