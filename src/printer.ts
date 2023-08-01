import {File, Suite, Task, Test} from "vitest";
import {SuitMessage} from "./messages/suite-message";
import {escape} from "./utils/escape";
import {TestMessage} from "./messages/test-message";
import {TaskResultPack} from "vitest";
import {VitestLogger} from "./reporter";


type PotentialMessage = string | (() => string | string[]);
type PotentialMessages = Array<PotentialMessage>;

export class Printer {
    private fileMap = new Map<string, PotentialMessages>;

    constructor(private logger: VitestLogger) {
    }

    public addFile = (file: File) => {
        const suitMessage = new SuitMessage(file.id, escape(file.name));
        const messages = [
            suitMessage.started(),
            ...file.tasks.flatMap(this.handleTask),
            suitMessage.finished(),
        ]
        this.fileMap.set(file.id, messages);
    }

    public handeUpdate = ([id, result]: TaskResultPack) => {
        const messages = this.fileMap.get(id);
        if (messages && result && result.state !== 'run') {
            messages
                .flatMap((message: PotentialMessage) => typeof message === 'string' ? message : message())
                .forEach(message => this.logger.console.info(message));
        }
    }

    private handleTask = (task: Task): PotentialMessage | PotentialMessage[] => {
        if (task.type === 'test') {
            return this.handleTest(task);
        }
        if (task.type === 'suite' && task.mode === 'run') {
            return this.handleSuite(task)
        }
        return []
    }

    private handleSuite = (suite: Suite): PotentialMessage[] => {
        const suitMessage = new SuitMessage(suite.file!.id, escape(suite.name));
        return [
            suitMessage.started(),
            ...suite.tasks.flatMap(this.handleTask),
            suitMessage.finished(),
        ]
    }

    private handleTest = (test: Test): PotentialMessage => {
        const testMessage = new TestMessage(test);
        if (test.mode === 'skip') {
            return testMessage.ignored();
        }
        return () => {
            const fail = test.result!.state === 'fail';
            return [
                testMessage.started(),
                fail ? testMessage.fail(test.result!.error) : '',
                testMessage.finished(test.result!.duration || 0)
            ].filter(Boolean);
        }
    }
}
