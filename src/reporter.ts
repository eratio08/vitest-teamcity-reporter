import { Awaitable, File, Reporter, TaskResultPack, UserConsoleLog } from 'vitest';
import { print, printTask, printTaskResultPack } from './printer';
import type { TaskIndex } from './printer'

class TeamCityReporter implements Reporter {
  private taskIndex: TaskIndex = new Map()

  onCollected(files?: File[]): Awaitable<void> {
    files?.forEach(printTask(this.taskIndex));

    return Promise.resolve();
  }

  onTaskUpdate(packs: TaskResultPack[]): Awaitable<void> {
    packs.reverse().forEach(printTaskResultPack(this.taskIndex));

    return Promise.resolve();
  }

  onUserConsoleLog(log: UserConsoleLog): Awaitable<void> {
    print(log);

    return Promise.resolve();
  }
}

export { TeamCityReporter };
