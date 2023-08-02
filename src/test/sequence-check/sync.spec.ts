import { describe, expect, it } from 'vitest'

describe('Example sequence-check sync file', () => {
  describe('Performance nested suit', () => {
    it('should return true', () => {
      expect('test').toEqual('test')
    })

    it('should return false', () => {
      expect('test').toEqual('test2')
    })
  })
})
