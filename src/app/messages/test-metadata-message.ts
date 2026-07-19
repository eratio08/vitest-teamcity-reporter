import type { TestCase } from 'vitest/node'
import { Message, type Parameters } from './message'

export class TestMetadataMessage extends Message {
  constructor(private readonly testCase: TestCase) {
    super(testCase.module.moduleId, testCase.name)
  }

  protected generate(type: string, parameters: Parameters = {}): string {
    return this.generateTeamcityMessage(type, this.id, parameters)
  }

  sourceFile(): string {
    return this.generate('testMetadata', {
      name: 'sourceFile',
      value: this.testCase.module.relativeModuleId,
    })
  }

  vitestFullName(): string {
    return this.generate('testMetadata', {
      name: 'vitestFullName',
      value: this.testCase.fullName,
    })
  }
}
