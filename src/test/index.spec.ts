import { describe, expect, it, vi } from 'vitest'
import { createVitest } from 'vitest/node'
import { configDefaults } from 'vitest/config'
import TeamCityReporter from '../app'
import workCheckExpect from './simple/work-check.expect'
import sequenceAsyncExpect from './sequence-check/async.expect'
import sequenceAsyncExpectSecond from './sequence-check/async-2.expect'
import sequenceSyncExpect from './sequence-check/sync.expect'
describe('main tests', () => {
  let consoleStub: any

  const startTest = async(paths: string[]): Promise<void> => {
    consoleStub = { info: vi.fn(), log: vi.fn() }
    const vitest = await createVitest('test', {
      ...configDefaults,
      watch: false,
      reporters: new TeamCityReporter()
    })
    vitest.logger.console = consoleStub as Console
    await vitest.start(paths)
    await vitest.close()
  }

  const getCalls = (): { info: string[], log: string[] } => ({
    info: consoleStub.info.mock.calls.flatMap((value: string[]) => value),
    log: consoleStub.log.mock.calls.flatMap((value: string[]) => value)
  })

  const compareResultWithExpect = (expectedResult: string[][], result: string[]): void => {
    expectedResult.forEach(([type, name], index) => {
      const message = result[index]
      expect(message).toContain(`##teamcity[${type} `)
      expect(message).toContain(`name='${name}'`)
    })
  }

  it('should run test and log into info', async() => {
    await startTest(['./simple/work-check.spec.ts'])
    const { info } = getCalls()

    expect(consoleStub.info).toHaveBeenCalled()
    expect(consoleStub.log).not.toHaveBeenCalled()
    expect(info.length).toEqual(12)
    compareResultWithExpect(workCheckExpect, info)
  })

  it('should run test and log into info', async() => {
    await startTest(['./sequence-check'])
    const { info } = getCalls()

    const gropedMessage = info.reduce((acc: { [key in string]: string[] }, message: string) => {
      const flowId = /flowId='(.+?)'/.exec(message)?.[1] ?? ''
      if (acc[flowId] == null) {
        acc[flowId] = []
      }
      acc[flowId].push(message)
      return acc
    }, {})

    expect(Object.keys(gropedMessage)).lengthOf(3)

    const expectMap = {
      [sequenceAsyncExpect[0][1]]: sequenceAsyncExpect,
      [sequenceAsyncExpectSecond[0][1]]: sequenceAsyncExpectSecond,
      [sequenceSyncExpect[0][1]]: sequenceSyncExpect
    }

    Object.values(gropedMessage).forEach((messages: string[]) => {
      const fileName = /name='(.+?)'/.exec(messages[0])?.[1] ?? ''

      const expectedResult = expectMap[fileName]

      expect(expectedResult).not.toBeUndefined()

      compareResultWithExpect(expectedResult, messages)
    })
  })
})
