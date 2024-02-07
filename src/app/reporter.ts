import { type Awaitable, type File, type Reporter, type TaskResultPack, type UserConsoleLog, type Vitest } from 'vitest'
import { Printer } from './printer'

class TeamCityReporter implements Reporter {
  private logger!: Vitest['logger']
  private printer!: Printer

  onInit(ctx: Vitest): void {
    this.logger = ctx.logger
    this.printer = new Printer(this.logger)
  }

  onCollected(files?: File[]): Awaitable<void> {
    files?.forEach(this.printer.addFile)
    return Promise.resolve()
  }

  onTaskUpdate(packs: TaskResultPack[]): Awaitable<void> {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        packs.reverse().forEach(this.printer.handeUpdate)
        resolve()
      })
    })
  }

  onUserConsoleLog(log: UserConsoleLog): Awaitable<void> {
    if (log.taskId != null) {
      this.printer.addTestConsoleLog(log.taskId, log)
    } else {
      this.logger.console.log(log)
    }
    return Promise.resolve()
  }
}

export { TeamCityReporter }
