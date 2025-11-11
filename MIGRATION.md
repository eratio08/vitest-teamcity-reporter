# Vitest 3 → 4 Migration

This reporter has been migrated from deprecated Vitest 3 APIs to Vitest 4 stable APIs. The TeamCity output format remains identical.

**Breaking Change:** This version requires Vitest 4.0.0 or later. If you're using Vitest 2.x or 3.x, use `vitest-teamcity-reporter@0.3.x` instead.

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

All types now come from `vitest/node` with new names:

```typescript
// Old
import { type File, type Suite, type Test } from 'vitest'

// New
import { type TestModule, type TestSuite, type TestCase } from 'vitest/node'
```

### Architecture Change

**Before:** Built all messages upfront during collection, printed them later on update.

**After:** Print messages immediately as lifecycle events occur (streaming).

### Data Access

- `file.tasks` → `testModule.children`
- `test.result` → `testCase.result()` (property → method)
- `test.name` → `testCase.fullName`
- `file.id` → `testModule.moduleId`

### Test/Suite Naming

Vitest 4's `fullName` includes the full hierarchy ("Suite A > Suite B > Test"). We extract just the last segment to maintain the old format.

### Skipped Suite Handling

Added logic to track which suites are reported. Tests inside `describe.skip()` or `describe.todo()` blocks are not reported, but individual `it.skip()` tests are.

### Hook Failure Handling

When `beforeAll`/`afterAll` hooks fail, Vitest 4 skips `onTestReady` but still calls `onTestResult`. We now:

1. Track which tests received `onTestReady`
2. Emit `testStarted` retroactively if needed
3. Traverse up the parent hierarchy to find hook errors

### Error Reporting

The old code looked for errors on `test.result?.errors ?? test.suite?.result?.errors ?? test.file?.result?.errors`.

The new code traverses the parent hierarchy explicitly:

```typescript
private getTestErrors(testCase: TestCase) {
  // Check test errors
  if (result.errors?.length > 0) return Array.from(result.errors)

  // Check parent suite/module errors (hook failures)
  let current = testCase.parent
  while (current.type !== 'module') {
    if (current.type === 'suite' && current.errors().length > 0) {
      return Array.from(current.errors())
    }
    current = current.parent
  }

  // Check module errors
  const moduleErrors = current.errors()
  if (moduleErrors.length > 0) return Array.from(moduleErrors)

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
