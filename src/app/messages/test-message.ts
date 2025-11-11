import { type TestCase } from 'vitest/node'
import { Message, type Parameters } from './message'

interface ErrorLike {
  message: string
  stackStr?: string
  actual?: unknown
  expected?: unknown
}

export class TestMessage extends Message {
  constructor(testCase: TestCase) {
    const testName = testCase.fullName.split(' > ').pop() ?? testCase.fullName
    super(testCase.module.moduleId, testName)
  }

  protected generate(type: string, parameters: Parameters = {}): string {
    return this.generateTeamcityMessage(type, this.id, { ...parameters, name: this.name })
  }

  fail = (error: ErrorLike): string => {
    return this.generate('testFailed', {
      message: error.message ?? '',
      details: error.stackStr ?? '',
      actual: (error.actual as string) ?? '',
      expected: (error.expected as string) ?? '',
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
