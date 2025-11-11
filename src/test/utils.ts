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
    
    // Try to match by full path or filename
    let expectedResult = expectMap[fileName]
    if (!expectedResult && fileName.includes('/')) {
      // Extract the relative path portion and try to find an exact match
      // For absolute paths like /Users/.../src/test/file.spec.ts
      // Try to match against relative paths like src/test/file.spec.ts
      const matchingKey = Object.keys(expectMap).find(key => {
        if (key.includes('/') && fileName.endsWith(key)) {
          return true
        }
        // Also try matching just the filename
        const justFileName = fileName.split('/').pop() ?? ''
        const keyFileName = key.split('/').pop() ?? ''
        return justFileName === keyFileName
      })
      if (matchingKey) {
        expectedResult = expectMap[matchingKey]
      }
    }

    expect(expectedResult).not.toBeUndefined()

    compareResultWithExpect(expectedResult, messages)
  })
}

export const compareResultWithExpect = (expectedResult: string[][], result: string[]): void => {
  expectedResult.forEach(([type, name], index) => {
    const message = result[index]
    expect(message).toContain(`##teamcity[${type} `)
    // For paths (containing /), just check if the message ends with the expected path
    // This handles both absolute and relative paths
    if (name.includes('/')) {
      const fileName = name.split('/').pop() ?? name
      expect(message).toMatch(new RegExp(`name='[^']*${fileName}'`))
    } else {
      expect(message).toContain(`name='${name}'`)
    }
  })
}
