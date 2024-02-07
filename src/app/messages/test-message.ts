import { type Test, type ErrorWithDiff } from 'vitest'
import { escape } from '../escape'
import { Message, type Parameters } from './message'

export class TestMessage extends Message {
  constructor(test: Test) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    super(test.file!.id, escape(test.name))
  }

  protected generate(type: string, parameters: Parameters = {}): string {
    return this.generateTeamcityMessage(type, this.id, { ...parameters, name: this.name })
  }

  fail = (error: ErrorWithDiff | undefined): string => {
    return this.generate('testFailed', {
      message: escape(error?.message ?? ''),
      details: escape(error?.stackStr ?? ''),
      actual: escape(error?.actual as string ?? ''),
      expected: escape(error?.expected as string ?? ''),
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
