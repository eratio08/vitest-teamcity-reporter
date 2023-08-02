import { Message, type Parameters } from './message'

export class SuitMessage extends Message {
  generate(type: string, parameters: Parameters = {}): string {
    return this.generateTeamcityMessage(type, this.id, { ...parameters, name: this.name })
  }

  started(): string {
    return this.generate('testSuiteStarted')
  }

  finished(): string {
    return this.generate('testSuiteFinished')
  }
}
