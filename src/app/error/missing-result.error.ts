import { type TestCase } from 'vitest/node'
import { type TestError } from '@vitest/utils'

export default class MissingResultError extends Error implements TestError {
  [key: string]: unknown

  constructor(testCase: TestCase) {
    super(`Test: "${testCase.fullName}" from - "${testCase.module.relativeModuleId}" missing a result after file test process finished`)
  }
}
