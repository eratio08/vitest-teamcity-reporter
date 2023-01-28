import { describe, it, vi, expect, File, Test, Suite, TaskResultPack } from 'vitest'
import { print, printTask, printTaskResultPack } from './printer'

vi.stubGlobal('console', { info: vi.fn() })

describe('printer', () => {
  describe('print', () => {
    it('should print given message and args to console.info', () => {
      //given
      const message = 'test message'
      const args = ['some', 'args']

      //when
      print(message, ...args)

      //then
      expect(console.info).toBeCalledWith(message, ...args)
    })
  })

  describe('printTask', () => {
    it('should print suite and nested test', () => {
      //given
      const suite: File = {
        type: 'suite',
        mode: 'run',
        id: 'some-id',
        name: 'some-suite',
        tasks: [],
        filepath: '/some/path'
      }
      const nestedSuite: Suite = {
        type: 'suite',
        mode: 'run',
        id: 'some-nested-suite',
        name: 'some-nested-suite',
        tasks: [],
        suite: suite
      }
      suite.tasks.push(nestedSuite)
      const nestedTest: Test = {
        type: 'test',
        mode: 'run',
        id: 'some-test',
        name: 'some-test',
        suite: nestedSuite,
        context: new (vi.fn())
      }
      nestedSuite.tasks.push(nestedTest)
      const taskIndex = new Map()

      //when
      printTask(taskIndex)(suite)

      //then
      expect(console.info).toHaveBeenCalledWith(`##teamcity[testSuiteStarted name='${suite.name}']`)
      expect(console.info).toHaveBeenCalledWith(`##teamcity[testSuiteStarted name='${nestedSuite.name}']`)
      expect(console.info).toHaveBeenCalledWith(`##teamcity[testStarted name='${nestedTest.name}']`)
      expect(taskIndex).toContain(suite)
      expect(taskIndex).toContain(nestedSuite)
      expect(taskIndex).toContain(nestedTest)
    })

    it("should print skipped tests", () => {
      //given
      const suite: File = {
        type: 'suite',
        mode: 'run',
        id: 'some-id',
        name: 'some-suite',
        tasks: [],
        filepath: '/some/path'
      }
      const nestedSuite: Suite = {
        type: 'suite',
        mode: 'skip',
        id: 'some-nested-suite',
        name: 'some-nested-suite',
        tasks: [],
        suite: suite
      }
      suite.tasks.push(nestedSuite)
      const nestedTest: Test = {
        type: 'test',
        mode: 'skip',
        id: 'some-test',
        name: 'some-test',
        suite: nestedSuite,
        context: new (vi.fn())
      }
      nestedSuite.tasks.push(nestedTest)
      const taskIndex = new Map()

      //when
      printTask(taskIndex)(suite)

      //then
      expect(console.info).toHaveBeenCalledWith(`##teamcity[testSuiteStarted name='${suite.name}']`)
      expect(console.info).not.toHaveBeenCalledWith(`##teamcity[testSuiteStarted name='${nestedSuite.name}']`)
      expect(console.info).toHaveBeenCalledWith(`##teamcity[testIgnored name='${nestedTest.name}' message='']`)
      expect(taskIndex).toContain(suite)
      expect(taskIndex).toContain(nestedSuite)
      expect(taskIndex).toContain(nestedTest)
    })
  })

  describe('printTaskResultPack', () => {
    it("should print passt suite as finished", () => {
      //given
      const taskResult: TaskResultPack[1] = {
        state: 'pass',
      }
      const suite: Suite = {
        type: 'suite',
        mode: 'skip',
        id: 'some-nested-suite',
        name: 'some-nested-suite',
        tasks: [],
        suite: new (vi.fn())
      }
      const taskIndex = new Map()
      taskIndex.set('id', suite)

      //when
      printTaskResultPack(taskIndex)(['id', taskResult])

      //then
      expect(console.info).toHaveBeenCalledWith(`##teamcity[testSuiteFinished name='${suite.name}']`)
    })

    it('shoult print passt test as finished', () => {
      //given
      const taskResult: TaskResultPack[1] = {
        state: 'pass',
        duration: 10,
      }
      const test: Test = {
        type: 'test',
        mode: 'run',
        id: 'some-test',
        name: 'some-test',
        suite: new (vi.fn()),
        context: new (vi.fn())
      }
      const taskIndex = new Map()
      taskIndex.set('id', test)

      //when
      printTaskResultPack(taskIndex)(['id', taskResult])

      //then
      expect(console.info).toHaveBeenCalledWith(`##teamcity[testFinished name='${test.name}' duration='${taskResult.duration}']`)
    })

    it("should print skipped test as ignored", () => {
      //given
      const taskResult: TaskResultPack[1] = {
        state: 'skip',
      }
      const test: Test = {
        type: 'test',
        mode: 'run',
        id: 'some-test',
        name: 'some-test',
        suite: new (vi.fn()),
        context: new (vi.fn())
      }
      const taskIndex = new Map()
      taskIndex.set('id', test)

      //when
      printTaskResultPack(taskIndex)(['id', taskResult])

      //then
      expect(console.info).toHaveBeenCalledWith(`##teamcity[testIgnored name='${test.name}' message='']`)
    })

    it("should print failed suite as failed", () => {
      //given
      const taskResult: TaskResultPack[1] = {
        state: 'fail',
      }
      const test: Test = {
        type: 'test',
        mode: 'run',
        id: 'some-test',
        name: 'some-test',
        suite: new (vi.fn()),
        context: new (vi.fn())
      }
      const taskIndex = new Map()
      taskIndex.set('id', test)

      //when
      printTaskResultPack(taskIndex)(['id', taskResult])

      //then
      expect(console.info).toHaveBeenCalledWith(`##teamcity[testFailed name='${test.name}' message='' details='' actual='' expected='' type='comparisonFailure']`)
    })

    it("should escape detail information on printing failed suite", () => {
      //given
      const unescaped_string = "'\n\r|[]"
      const escaped_string = "|'|n|r|||[|]"

      const taskResult: TaskResultPack[1] = {
        state: 'fail',
        error: {
          name: unescaped_string,
          message: unescaped_string,
          stackStr: unescaped_string,
          actual: unescaped_string,
          expected: unescaped_string,
        }
      }
      const test: Test = {
        type: 'test',
        mode: 'run',
        id: 'some-test',
        name: 'some-test',
        suite: new (vi.fn()),
        context: new (vi.fn())
      }
      const taskIndex = new Map()
      taskIndex.set('id', test)

      //when
      printTaskResultPack(taskIndex)(['id', taskResult])

      //then
      expect(console.info).toHaveBeenCalledWith(`##teamcity[testFailed name='${test.name}' message='${escaped_string}' details='${escaped_string}' actual='${escaped_string}' expected='${escaped_string}' type='comparisonFailure']`)
    })
  })
})
