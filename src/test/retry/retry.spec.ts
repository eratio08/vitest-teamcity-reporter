import { expect, test } from 'vitest'

let attempts = 0

test('reports metadata once for a retried test', { retry: 1 }, () => {
  attempts += 1
  expect(attempts).toBe(2)
})
