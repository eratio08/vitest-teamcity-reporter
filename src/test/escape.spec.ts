import { describe, expect, it } from 'vitest'
import type { TestCase } from 'vitest/node'
import { escapeSpecials } from '../app/escape'
import { SuiteMessage } from '../app/messages/suite-message'
import { TestMessage } from '../app/messages/test-message'
import { TestMetadataMessage } from '../app/messages/test-metadata-message'

const escapeMap = {
  '\x1B1m': '',
  '|': '||',
  '\n': '|n',
  '\r': '|r',
  '[': '|[',
  ']': '|]',
  '\u0085': '|x',
  '\u2028': '|l',
  '\u2029': '|p',
  "'": "|'",
}

const testNumber = Math.random()
const expectedNumber = testNumber.toString()

const testString = Object.keys(escapeMap).join('')
const expectedString = Object.values(escapeMap).join('')

describe('Checking message escaping functionality', () => {
  it('escaping of simple string or number is correct', () => {
    const escapedString = escapeSpecials(testString)
    expect(escapedString).toStrictEqual(expectedString)

    const escapedNumber = escapeSpecials(testNumber)
    expect(escapedNumber).toStrictEqual(expectedNumber)
  })

  it('suite message parameters are correctly escaped', () => {
    const messageId = 'messageId'
    const messageName = 'messageName'
    const messageType = 'messageType'

    const message = new SuiteMessage(messageId, messageName)

    const escapedParameters = message.generate(messageType, {
      testString,
      testNumber,
    })

    expect(escapedParameters).toStrictEqual(
      `##teamcity[${messageType} flowId='${messageId}' testString='${expectedString}' testNumber='${expectedNumber}' name='${messageName}']`,
    )
  })

  it('test name is correctly escaped', () => {
    const testName = testString
    const fileId = 'fileId'

    const testCase = {
      name: testName,
      module: {
        moduleId: fileId,
      },
    } as unknown as TestCase

    const test = new TestMessage(testCase)

    const escapedMessage = test.started()
    expect(escapedMessage).toStrictEqual(`##teamcity[testStarted flowId='${fileId}' name='${expectedString}']`)
  })

  it('test metadata values are correctly escaped', () => {
    const testCase = {
      name: 'test name',
      fullName: testString,
      module: {
        moduleId: 'fileId',
        relativeModuleId: testString,
      },
    } as unknown as TestCase

    const metadata = new TestMetadataMessage(testCase)

    expect(metadata.sourceFile()).toStrictEqual(
      `##teamcity[testMetadata flowId='fileId' name='sourceFile' value='${expectedString}']`,
    )
    expect(metadata.vitestFullName()).toStrictEqual(
      `##teamcity[testMetadata flowId='fileId' name='vitestFullName' value='${expectedString}']`,
    )
  })
})
