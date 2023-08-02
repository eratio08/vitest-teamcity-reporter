import { type File, type Suite, type Task, type Test, type UserConsoleLog, type TaskResultPack } from 'vitest'
import { SuitMessage } from './messages/suite-message'
import { escape } from './escape'
import { TestMessage } from './messages/test-message'
import { type VitestLogger } from './reporter'

type PotentialMessage = string | (() => string | string[])
type PotentialMessages = PotentialMessage[]

export class Printer {
  private readonly fileMap = new Map<string, PotentialMessages>()
  private readonly testConsoleMap = new Map<string, UserConsoleLog[]>()

  constructor(private readonly logger: VitestLogger) {
  }

  public addFile = (file: File): void => {
    const suitMessage = new SuitMessage(file.id, escape(file.name))
    const messages = [
      suitMessage.started(),
      ...file.tasks.flatMap(this.handleTask),
      suitMessage.finished()
    ]
    this.fileMap.set(file.id, messages)
  }

  public addTestConsoleLog(id: string, log: UserConsoleLog): void {
    const messages = this.testConsoleMap.get(id)
    if (messages != null) {
      messages.push(log)
    } else {
      this.testConsoleMap.set(id, [log])
    }
  }

  public handeUpdate = ([id, result]: TaskResultPack): void => {
    const messages = this.fileMap.get(id)
    if ((messages != null) && (result != null) && result.state !== 'run') {
      messages
        .flatMap((message: PotentialMessage) => typeof message === 'string' ? message : message())
        .forEach(message => { this.logger.console.info(message) })
    }
  }

  private readonly handleTask = (task: Task): PotentialMessage | PotentialMessage[] => {
    if (task.type === 'test') {
      return this.handleTest(task)
    }
    if (task.type === 'suite' && task.mode === 'run') {
      return this.handleSuite(task)
    }
    return []
  }

  private readonly handleSuite = (suite: Suite): PotentialMessage[] => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const suitMessage = new SuitMessage(suite.file!.id, escape(suite.name))
    return [
      suitMessage.started(),
      ...suite.tasks.flatMap(this.handleTask),
      suitMessage.finished()
    ]
  }

  private readonly handleTest = (test: Test): PotentialMessage => {
    const testMessage = new TestMessage(test)
    if (test.mode === 'skip') {
      return testMessage.ignored()
    }
    return () => {
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      const fail = test.result!.state === 'fail'
      const logs = this.testConsoleMap.get(test.id) ?? []
      const logsMessages = logs.map(log => testMessage.log(log.type, log.content))
      return [
        testMessage.started(),
        ...logsMessages,
        fail ? testMessage.fail(test.result!.error) : '',
        testMessage.finished(test.result!.duration ?? 0)
      ].filter(Boolean)
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
    }
  }
}
