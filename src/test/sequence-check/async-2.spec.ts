import { describe, expect, it } from 'vitest'
import { delayPromise } from '../../utils/delay-promise'

describe('Example sequence-check async file 2', () => {
  describe('Test log with async', () => {
    it('should log 2 times', async () => {
      console.log('Text from "async file 2" without delay')
      await delayPromise()
      console.log('Text from "async file 2" without delay')
      expect(true).toBeTruthy()
    })

    it('should log after 1000 ms', async () => {
      await delayPromise(1000)
      console.log('Text from "async file 2" with 1000ms')
      expect(true).toBeTruthy()
    })
  })
})
