import { describe, expect, it, vi } from 'vitest'
import { configDefaults } from 'vitest/config'
import { createVitest, type InlineConfig } from 'vitest/node'
import TeamCityReporter from '../app'
import missTestWithProblemExpect from './miss-test-result/miss-test-result-with-problem.expect'
import missTestWithoutProblemExpect from './miss-test-result/miss-test-result-without-problem.expect'
import sequenceAsyncExpect from './sequence-check/async.expect'
import sequenceAsyncSecondExpect from './sequence-check/async-2.expect'
import sequenceSyncExpect from './sequence-check/sync.expect'
import workCheckExpect from './simple/work-check.expect'
import { compareResultWithExpect, generateExpectTest } from './utils'

vi.setConfig({ testTimeout: 15000 })

describe('main tests', () => {
  // biome-ignore lint/suspicious/noExplicitAny: fine for the test
  let consoleStub: any

  const startTest = async (paths: string[], config: Partial<InlineConfig> = {}): Promise<void> => {
    consoleStub = { info: vi.fn(), log: vi.fn() }
    const vitest = await createVitest('test', {
      ...configDefaults,
      ...config,
      watch: false,
      reporters: new TeamCityReporter(),
    })
    vitest.logger.console = consoleStub as Console
    await vitest.start(paths)
    await vitest.close()
  }

  const getCalls = (): { info: string[]; log: string[] } => ({
    info: consoleStub.info.mock.calls.flatMap((value: string[]) => value),
    log: consoleStub.log.mock.calls.flatMap((value: string[]) => value),
  })

  it('should run test and log into info', async () => {
    await startTest(['./simple/work-check.spec.ts'])
    const { info } = getCalls()

    expect(consoleStub.info).toHaveBeenCalled()
    expect(consoleStub.log).not.toHaveBeenCalled()
    expect(info.length).toEqual(13)
    compareResultWithExpect(workCheckExpect, info)
  })

  it('should exclude case when miss result test if before/after hooks have a idle', async () => {
    await startTest(['./miss-test-result'])
    const { info } = getCalls()

    expect(consoleStub.info).toHaveBeenCalled()
    const expectMap = {
      [missTestWithProblemExpect[0][1]]: missTestWithProblemExpect,
      [missTestWithoutProblemExpect[0][1]]: missTestWithoutProblemExpect,
    }
    generateExpectTest(info, expectMap)
  })

  it('reports unhandled errors as TeamCity failures', async () => {
    await startTest(['./unhandled-error.spec.ts'])
    const { info } = getCalls()

    const suiteStart = info.find(
      (message) =>
        message.startsWith('##teamcity[testSuiteStarted') && message.includes("name='Vitest unhandled errors'"),
    )
    const suiteFlowId = suiteStart?.match(/flowId='([^']+)'/)?.[1]

    expect(suiteFlowId).toBeDefined()
    expect(info.some((message) => message.startsWith(`##teamcity[testStarted flowId='${suiteFlowId}'`))).toBe(true)
    expect(info.some((message) => message.startsWith('##teamcity[testFailed '))).toBe(true)
    expect(info.some((message) => message.includes("message='unhandled rejection from fixture'"))).toBe(true)
    expect(info.some((message) => message.includes("details='Error: unhandled rejection from fixture"))).toBe(true)
    expect(
      info.some((message) =>
        message.includes(
          "##teamcity[buildProblem description='Vitest unhandled error: unhandled rejection from fixture'",
        ),
      ),
    ).toBe(true)
    expect(
      info.some((message) => message.includes("description='Vitest unhandled error: Unknown unhandled error'")),
    ).toBe(true)

    const problemIdentities = info
      .filter((message) => message.startsWith('##teamcity[buildProblem '))
      .map((message) => message.match(/identity='([^']+)'/)?.[1])
    expect(new Set(problemIdentities).size).toBe(2)
  })

  it('should run test and log into info', async () => {
    await startTest(['./sequence-check'])
    const { info } = getCalls()

    expect(consoleStub.info).toHaveBeenCalled()
    const expectMap = {
      [sequenceAsyncExpect[0][1]]: sequenceAsyncExpect,
      [sequenceAsyncSecondExpect[0][1]]: sequenceAsyncSecondExpect,
      [sequenceSyncExpect[0][1]]: sequenceSyncExpect,
    }
    generateExpectTest(info, expectMap)
  })
})
