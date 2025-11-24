import { type TestCase } from 'vitest/node'
import { type TestError } from '@vitest/utils'
import { Message, type Parameters } from './message'

export class TestMessage extends Message {
  constructor(testCase: TestCase) {
    super(testCase.module.moduleId, testCase.name)
  }

  protected generate(type: string, parameters: Parameters = {}): string {
    return this.generateTeamcityMessage(type, this.id, { ...parameters, name: this.name })
  }

  fail = (error: TestError): string => {
    return this.generate('testFailed', {
      message: error.message,
      details: error.stack ?? '',
      actual: String(error.actual ?? ''),
      expected: String(error.expected ?? ''),
    })
  }

  started = (): string => {
    return this.generate('testStarted')
  }

  finished = (duration: number): string => {
    return this.generate('testFinished', { duration })
  }

  ignored = (): string => {
    return this.generate('testIgnored')
  }

  stdOut = (out: string): string => {
    return this.generate('testStdOut', { out })
  }

  stdErr = (out: string): string => {
    return this.generate('testStdErr', { out })
  }

  log = (type: 'stdout' | 'stderr', out: string): string => {
    return type === 'stdout' ? this.stdOut(out) : this.stdErr(out)
  }
}
