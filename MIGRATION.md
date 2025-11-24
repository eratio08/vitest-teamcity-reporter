# Vitest 3 → 4 Migration

This reporter has been migrated from deprecated Vitest 3 APIs to Vitest 4 stable APIs. The TeamCity output format remains identical.

**Breaking Change:** This version requires Vitest 3.0.0 or later. If you're using Vitest 2.x or earlier, use `vitest-teamcity-reporter@0.3.x` instead.

## What Changed

### Reporter Hooks

The old collection-based hooks were replaced with event-driven lifecycle hooks:

```typescript
// Old
onCollected(files?: File[]): void
onTaskUpdate(packs: TaskResultPack[]): void

// New
onTestModuleCollected(testModule: TestModule): void
onTestSuiteReady(testSuite: TestSuite): void
onTestCaseReady(testCase: TestCase): void
onTestCaseResult(testCase: TestCase): void
onTestSuiteResult(testSuite: TestSuite): void
onTestModuleEnd(testModule: TestModule): void
```

### Type Imports

Types now come from `vitest/node` and `vitest` with new names:

```typescript
// Old
import { type File, type Suite, type Test, type UserConsoleLog } from 'vitest'

// New
import { type TestModule, type TestSuite, type TestCase } from 'vitest/node'
import { type UserConsoleLog } from 'vitest'
import { type TestError } from '@vitest/utils'
```

### Architecture Change

**Before:** Built all messages upfront during collection, printed them later on update.

**After:** Print messages immediately as lifecycle events occur (streaming).

### Data Access

- `file.tasks` → `testModule.children`
- `test.result` → `testCase.result()` (property → method)
- `test.name` → `testCase.name` (unchanged)
- `file.id` → `testModule.moduleId`
- `file.filepath` → `testModule.relativeModuleId` (for display)

### Test/Suite Naming

Test and suite names use their direct `.name` property, maintaining a flat naming structure.

### Skipped Test Handling

Skipped tests are detected using `testCase.result().state === 'skipped'`. Tests inside `describe.skip()` or `describe.todo()` blocks are not reported, but individual `it.skip()` tests are.

### Hook Failure Handling

When `beforeAll`/`afterAll` hooks fail, Vitest 4 skips `onTestReady` but still calls `onTestResult`. We now:

1. Track which tests received `onTestReady`
2. Emit `testStarted` retroactively if needed
3. Traverse up the parent hierarchy to find hook errors

### Error Reporting

The old code looked for errors on `test.result?.errors ?? test.suite?.result?.errors ?? test.file?.result?.errors`.

The new code uses proper types from `@vitest/utils` and traverses the parent hierarchy explicitly:

```typescript
private getTestErrors(testCase: TestCase): TestError[] {
  // Check test errors
  if (result.errors?.length > 0) return [...result.errors]

  // Check parent suite/module errors (hook failures)
  let current = testCase.parent
  while (current.type !== 'module') {
    if (current.type === 'suite' && current.errors().length > 0) {
      return current.errors()
    }
    current = current.parent
  }

  // Check module errors
  const moduleErrors = current.errors()
  if (moduleErrors.length > 0) return moduleErrors

  return [new MissingResultError(testCase)]
}
```

## Files Modified

- `src/app/reporter.ts` - New lifecycle hooks
- `src/app/printer.ts` - Complete rewrite (collection → event-driven)
- `src/app/messages/test-message.ts` - Use TestCase API
- `src/app/error/missing-result.error.ts` - Use TestCase API
- `src/test/escape.spec.ts` - Updated mock structure
- `src/test/index.spec.ts` - Fixed imports
- `src/test/utils.ts` - Better path matching (absolute/relative)

## Test Results

All functional tests pass. The 3 "failing" tests are intentional (they verify error reporting works).

## Compatibility

The TeamCity output format is unchanged. All `##teamcity[...]` messages remain identical.

## References

- [Vitest 4 Migration Guide](https://vitest.dev/guide/migration.html#reporter-updates)
- [Vitest 4 Reporter API](https://vitest.dev/advanced/api/reporters.html)
