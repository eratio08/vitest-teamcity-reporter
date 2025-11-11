import { describe, expect, it, vi } from 'vitest'
import { createVitest } from 'vitest/node'
import { configDefaults } from 'vitest/config'
import TeamCityReporter from '../app'
import workCheckExpect from './simple/work-check.expect'
import sequenceAsyncExpect from './sequence-check/async.expect'
import sequenceAsyncSecondExpect from './sequence-check/async-2.expect'
import missTestWithoutProblemExpect from './miss-test-result/miss-test-result-without-problem.expect'
import missTestWithProblemExpect from './miss-test-result/miss-test-result-with-problem.expect'
import sequenceSyncExpect from './sequence-check/sync.expect'
import { compareResultWithExpect, generateExpectTest } from './utils'

describe('main tests', () => {
  let consoleStub: any

  const startTest = async(paths: string[], config: Record<string, any> = {}): Promise<void> => {
    consoleStub = { info: vi.fn(), log: vi.fn() }
    const vitest = await createVitest('test', {
      ...configDefaults,
      ...config,
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

  it('should run test and log into info', async() => {
    await startTest(['./simple/work-check.spec.ts'])
    const { info } = getCalls()

    expect(consoleStub.info).toHaveBeenCalled()
    expect(consoleStub.log).not.toHaveBeenCalled()
    expect(info.length).toEqual(13)
    compareResultWithExpect(workCheckExpect, info)
  })

  it('should exclude case when miss result test if before/after hooks have a idle', async() => {
    await startTest(['./miss-test-result'])
    const { info } = getCalls()

    expect(consoleStub.info).toHaveBeenCalled()
    const expectMap = {
      [missTestWithProblemExpect[0][1]]: missTestWithProblemExpect,
      [missTestWithoutProblemExpect[0][1]]: missTestWithoutProblemExpect
    }
    generateExpectTest(info, expectMap)
  })

  it('should run test and log into info', async() => {
    await startTest(['./sequence-check'])
    const { info } = getCalls()

    expect(consoleStub.info).toHaveBeenCalled()
    const expectMap = {
      [sequenceAsyncExpect[0][1]]: sequenceAsyncExpect,
      [sequenceAsyncSecondExpect[0][1]]: sequenceAsyncSecondExpect,
      [sequenceSyncExpect[0][1]]: sequenceSyncExpect
    }
    generateExpectTest(info, expectMap)
  })
})
