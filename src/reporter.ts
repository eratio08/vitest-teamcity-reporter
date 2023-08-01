import {Awaitable, File, Reporter, TaskResultPack, UserConsoleLog, Vitest} from 'vitest';
import {Printer} from './printer';

export interface VitestLogger {
    log(...args: any[]): void;

    console: Console,
}

class TeamCityReporter implements Reporter {
    private _logger!: VitestLogger;
    private _printer!: Printer;

    onInit(ctx: Vitest) {
        this._logger = ctx.logger;
        this._printer = new Printer(this._logger);
    }

    onCollected(files?: File[]): Awaitable<void> {
        files?.forEach(this._printer.addFile);
        return Promise.resolve();
    }

    onTaskUpdate(packs: TaskResultPack[]): Awaitable<void> {
        packs.reverse().forEach(this._printer.handeUpdate);
        return Promise.resolve();
    }

    onUserConsoleLog(log: UserConsoleLog): Awaitable<void> {
        this._logger.log(log);
        return Promise.resolve();
    }
}

export {TeamCityReporter};
