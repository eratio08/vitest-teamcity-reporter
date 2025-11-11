import { type TestModule, type TestSuite, type TestCase, type Vitest } from 'vitest/node'
import { SuitMessage } from './messages/suite-message'
import { escape } from './escape'
import { TestMessage } from './messages/test-message'
import MissingResultError from './error/missing-result.error'

interface UserConsoleLog {
  taskId?: string
  type: 'stdout' | 'stderr'
  content: string
}

export class Printer {
  private readonly testConsoleMap = new Map<string, UserConsoleLog[]>()
  private readonly reportedSuites = new Set<string>()
  private readonly startedTests = new Set<string>()

  constructor(private readonly logger: Vitest['logger']) {}

  public onModuleCollected(testModule: TestModule): void {
    const suitMessage = new SuitMessage(testModule.moduleId, escape(testModule.moduleId))
    this.log(suitMessage.started())
    this.reportedSuites.add(testModule.moduleId)
  }

  public onSuiteReady(testSuite: TestSuite): void {
    if (testSuite.options.mode === 'skip' || testSuite.options.mode === 'todo') {
      return
    }
    const suiteName = this.extractSuiteName(testSuite.fullName)
    const suitMessage = new SuitMessage(testSuite.module.moduleId, escape(suiteName))
    this.log(suitMessage.started())
    this.reportedSuites.add(testSuite.id)
  }

  public onTestReady(testCase: TestCase): void {
    if (!this.isTestInReportedSuite(testCase)) {
      return
    }
    if (testCase.options.mode === 'skip' || testCase.options.mode === 'todo') {
      const testMessage = new TestMessage(testCase)
      this.log(testMessage.ignored())
      return
    }
    const testMessage = new TestMessage(testCase)
    this.log(testMessage.started())
    this.startedTests.add(testCase.id)
  }

  public onTestResult(testCase: TestCase): void {
    if (!this.isTestInReportedSuite(testCase)) {
      return
    }
    if (testCase.options.mode === 'skip' || testCase.options.mode === 'todo') {
      return
    }

    const testMessage = new TestMessage(testCase)
    
    // If testStarted wasn't called (e.g., due to hook failure), emit it now
    if (!this.startedTests.has(testCase.id)) {
      this.log(testMessage.started())
    }
    this.startedTests.delete(testCase.id)

    const result = testCase.result()

    const logs = this.testConsoleMap.get(testCase.id) ?? []
    logs.forEach((log) => {
      this.log(testMessage.log(log.type, log.content))
    })
    this.testConsoleMap.delete(testCase.id)

    // Check for errors even if state is not 'failed' (e.g., hook failures)
    const errors = this.getTestErrors(testCase)
    const hasRealErrors = errors.length > 0 && !(errors[0] instanceof MissingResultError)
    
    if (result.state === 'failed' || hasRealErrors) {
      errors.forEach((error) => {
        this.log(testMessage.fail(error))
      })
    }

    const diagnostic = testCase.diagnostic()
    this.log(testMessage.finished(diagnostic?.duration ?? 0))
  }

  public onSuiteResult(testSuite: TestSuite): void {
    if (testSuite.options.mode === 'skip' || testSuite.options.mode === 'todo') {
      return
    }
    const suiteName = this.extractSuiteName(testSuite.fullName)
    const suitMessage = new SuitMessage(testSuite.module.moduleId, escape(suiteName))
    this.log(suitMessage.finished())
    this.reportedSuites.delete(testSuite.id)
  }

  public onModuleEnd(testModule: TestModule): void {
    const suitMessage = new SuitMessage(testModule.moduleId, escape(testModule.moduleId))
    this.log(suitMessage.finished())
    this.reportedSuites.delete(testModule.moduleId)
  }

  public addTestConsoleLog(id: string, log: UserConsoleLog): void {
    const messages = this.testConsoleMap.get(id)
    if (messages != null) {
      messages.push(log)
    } else {
      this.testConsoleMap.set(id, [log])
    }
  }

  private log(message: string): void {
    this.logger.console.info(message)
  }

  private extractSuiteName(fullName: string): string {
    const parts = fullName.split(' > ')
    return parts[parts.length - 1]
  }

  private isTestInReportedSuite(testCase: TestCase): boolean {
    let current: TestCase | TestSuite | TestModule = testCase
    while (current.type !== 'module') {
      if (current.type === 'suite' && !this.reportedSuites.has(current.id)) {
        return false
      }
      current = current.parent
    }
    return true
  }

  private getTestErrors(testCase: TestCase): Array<{ message: string; stackStr?: string; actual?: unknown; expected?: unknown }> {
    const result = testCase.result()
    
    // Check test errors first
    if (result.errors && result.errors.length > 0) {
      return Array.from(result.errors)
    }
    
    // Check parent suite errors (e.g., from failed hooks)
    let current: TestCase | TestSuite | TestModule = testCase.parent
    while (current.type !== 'module') {
      if (current.type === 'suite') {
        const suiteErrors = current.errors()
        if (suiteErrors.length > 0) {
          return Array.from(suiteErrors)
        }
      }
      current = current.parent
    }
    
    // Check module errors
    if (current.type === 'module') {
      const moduleErrors = current.errors()
      if (moduleErrors.length > 0) {
        return Array.from(moduleErrors)
      }
    }
    
    return [new MissingResultError(testCase)]
  }
}
