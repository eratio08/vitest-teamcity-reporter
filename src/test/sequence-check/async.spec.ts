import { delayPromise } from '../../utils/delay-promise'
import { describe, expect, it } from 'vitest'

describe('Example sequence-check async file 1', () => {
  describe('Test async done', () => {
    it('should be done after 100ms and console log', async() => {
      await delayPromise(100)
      console.log('Text from "async file 1" after 100ms delay')
      expect(true).toBeTruthy()
    })

    it('should be done after 1500ms', async() => {
      await delayPromise(1500)
      expect(true).toBeTruthy()
    })
  })
})
