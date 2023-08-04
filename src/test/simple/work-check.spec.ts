import { describe, expect, it } from 'vitest'

describe('Example test suite what generate 12 messages', () => {
  it('should fired message about test start and finished', () => {
    const number = 1
    expect(number === 1).toBeTruthy()
  })

  describe('should fired event suit start', () => {
    it('should fired event test start, user std out and finished', () => {
      const number: number = 2
      console.log('Here a stdOut')
      expect(number === 1).toBeFalsy()
    })

    it.skip('should fired event test ignored', () => {
      expect(1).toEqual(2)
    })
  })

  describe.skip('should not fired any event', () => {
    it('should not fired any event 2', () => {
      expect(1).toEqual(2)
    })

    it('should not fired any event 2', () => {
      expect(1).toEqual(2)
    })
  })
})
