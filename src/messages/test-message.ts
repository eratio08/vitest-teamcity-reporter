import {Test, ErrorWithDiff} from "vitest";
import {escape} from "../utils/escape";
import {Message, generateMessage} from "./message";


export class TestMessage extends Message {
    constructor(private test: Test) {
        super(test.file!.id, test.name)
    }

    protected generate(type: string, parameters: object = {}) {
        return generateMessage(type, this.id, {...parameters, name: this.name})
    }

    fail(error: ErrorWithDiff | undefined) {
        return this.generate('testFailed', {
            message: escape(error?.message ?? ''),
            details: escape(error?.stackStr ?? ''),
            actual: escape(error?.actual ?? ''),
            expected: escape(error?.expected ?? ''),
        })
    }

    started() {
        return this.generate('testStarted')
    }

    finished(duration: number) {
        return this.generate('testFinished', {duration})
    }

    ignored() {
        return this.generate('testIgnored')
    }
}
