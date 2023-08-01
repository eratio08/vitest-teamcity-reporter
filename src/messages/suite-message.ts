import {Message, generateMessage} from "./message";


export class SuitMessage extends Message {
    generate(type: string, parameters: object = {}) {
        return generateMessage(type, this.id, {...parameters, name: this.name})
    }

    started() {
        return this.generate('testSuiteStarted')
    }

    finished() {
        return this.generate('testSuiteFinished')
    }
}
