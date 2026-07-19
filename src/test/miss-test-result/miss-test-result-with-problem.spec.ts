import { beforeAll, describe, expect, it } from 'vitest'

describe('With delayed hook', () => {
  beforeAll(async () => {
    return await new Promise((resolve) => setTimeout(resolve, 10000))
  }, 10000)

  it('first test delays the execution result', async () => {
    expect('true').toEqual('true')
  })

  it('second test delays the execution result', async () => {
    expect('false').toEqual('true')
  })
})
