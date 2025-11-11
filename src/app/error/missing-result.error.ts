import { type TestCase } from 'vitest/node'

export default class MissingResultError extends Error {
  constructor(testCase: TestCase) {
    super(`Test: "${testCase.fullName}" from - "${testCase.module.moduleId}" missing a result after file test process finished`)
  }
}
