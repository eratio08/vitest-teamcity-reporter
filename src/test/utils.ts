import { expect } from 'vitest'

export const generateExpectTest = (info: string[], expectMap: Record<string, string[][]>): void => {
  const gropedMessage = info.reduce((acc: { [key in string]: string[] }, message: string) => {
    const flowId = /flowId='(.+?)'/.exec(message)?.[1] ?? ''
    if (acc[flowId] == null) {
      acc[flowId] = []
    }
    acc[flowId].push(message)
    return acc
  }, {})

  expect(Object.keys(gropedMessage)).lengthOf(Object.keys(expectMap).length)

  Object.values(gropedMessage).forEach((messages: string[]) => {
    const fileName = /name='(.+?)'/.exec(messages[0])?.[1] ?? ''

    const expectedResult = expectMap[fileName]

    expect(expectedResult).not.toBeUndefined()

    compareResultWithExpect(expectedResult, messages)
  })
}

export const compareResultWithExpect = (expectedResult: string[][], result: string[]): void => {
  expectedResult.forEach(([type, name], index) => {
    const message = result[index]
    expect(message).toContain(`##teamcity[${type} `)
    expect(message).toContain(`name='${name}'`)
  })
}
