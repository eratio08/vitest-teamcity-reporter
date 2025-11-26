import { describe, expect, it } from 'vitest'

describe('Example test suite', () => {
  it('Example test', () => {
    expect(true).toBeTruthy()
  })

  describe('Nested test suite', () => {
    it('Example test from nested suite', () => {
      const number: number = 2
      expect(1 === number).toBeFalsy()
    })

    it.skip('Example ignore test', () => {
      expect(1).toEqual(2)
    })
  })

  describe.skip('Example skip test suit', () => {
    it('should be skipped 1', () => {
      expect(1).toEqual(2)
    })

    it('should be skipped 2', () => {
      expect(1).toEqual(2)
    })
  })
})
