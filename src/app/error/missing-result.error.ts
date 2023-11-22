import { type ErrorWithDiff, type Test } from 'vitest'

export default class MissingResultError extends Error implements ErrorWithDiff {
  constructor(test: Test) {
    super(`Test: "${test.name}" from - "${test.file?.filepath ?? 'unknown'}" missing a result after file test process finished`)
  }
}
