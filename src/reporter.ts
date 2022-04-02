import { Awaitable, File, Reporter, TaskResultPack, UserConsoleLog } from 'vitest';
import { print, printTask, printTaskResultPack } from './printer';

class TeamCityReporter implements Reporter {
    onCollected(files?: File[]): Awaitable<void> {
        files?.forEach(printTask);

        return Promise.resolve();
    }

    onTaskUpdate(packs: TaskResultPack[]): Awaitable<void> {
        packs.reverse().forEach(printTaskResultPack);

        return Promise.resolve();
    }

    onUserConsoleLog(log: UserConsoleLog): Awaitable<void> {
        print(log);

        return Promise.resolve();
    }
}

export { TeamCityReporter };
