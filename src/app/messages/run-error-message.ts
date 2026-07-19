import type { SerializedError } from '@vitest/utils'
import { escapeSpecials } from '../escape'
import { Message, type Parameters } from './message'

export class RunErrorMessage extends Message {
  constructor(
    flowId: string,
    name: string,
    private readonly identity: string,
  ) {
    super(flowId, name)
  }

  protected generate(type: string, parameters: Parameters = {}): string {
    return this.generateTeamcityMessage(type, this.id, { ...parameters, name: this.name })
  }

  started(): string {
    return this.generate('testStarted')
  }

  failed(error: SerializedError): string {
    const message = this.getErrorMessage(error)
    return this.generate('testFailed', {
      message,
      details: error.stack ?? message,
    })
  }

  finished(): string {
    return this.generate('testFinished', { duration: 0 })
  }

  buildProblem(error: SerializedError): string {
    return `##teamcity[buildProblem description='${escapeSpecials(`Vitest unhandled error: ${this.getErrorMessage(error)}`)}' identity='${escapeSpecials(this.identity)}']`
  }

  private getErrorMessage(error: SerializedError): string {
    return error.message || 'Unknown unhandled error'
  }
}
