import { type Reporter, type TestModule, type TestSuite, type TestCase, type Vitest } from 'vitest/node'
import { type UserConsoleLog } from 'vitest'
import { Printer } from './printer'

class TeamCityReporter implements Reporter {
  private logger!: Vitest['logger']
  private printer!: Printer

  onInit(ctx: Vitest): void {
    this.logger = ctx.logger
    this.printer = new Printer(this.logger)
  }

  onTestModuleCollected(testModule: TestModule): void {
    this.printer.onModuleCollected(testModule)
  }

  onTestSuiteReady(testSuite: TestSuite): void {
    this.printer.onSuiteReady(testSuite)
  }

  onTestCaseReady(testCase: TestCase): void {
    this.printer.onTestReady(testCase)
  }

  onTestCaseResult(testCase: TestCase): void {
    this.printer.onTestResult(testCase)
  }

  onTestSuiteResult(testSuite: TestSuite): void {
    this.printer.onSuiteResult(testSuite)
  }

  onTestModuleEnd(testModule: TestModule): void {
    this.printer.onModuleEnd(testModule)
  }

  onUserConsoleLog(log: UserConsoleLog): void {
    if (log.taskId != null) {
      this.printer.addTestConsoleLog(log.taskId, log)
    } else {
      this.logger.console.log(log)
    }
  }
}

export { TeamCityReporter }
