import { test } from 'vitest'

test('completes before asynchronous rejections', async () => {
  setTimeout(() => Promise.reject(new Error('unhandled rejection from fixture')), 10)
  setTimeout(() => Promise.reject({ code: 'E_CUSTOM' }), 15)
  await new Promise((resolve) => setTimeout(resolve, 20))
})
