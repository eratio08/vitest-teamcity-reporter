export const escapeSpecials = (str: string | number = ''): string => {
  return (
    str
      .toString()
      // biome-ignore lint/suspicious/noControlCharactersInRegex: needed to remove ANSI codes
      .replace(/\x1B.*?m/g, '')
      .replace(/\|/g, '||')
      .replace(/\n/g, '|n')
      .replace(/\r/g, '|r')
      .replace(/\[/g, '|[')
      .replace(/]/g, '|]')
      .replace(/\u0085/g, '|x')
      .replace(/\u2028/g, '|l')
      .replace(/\u2029/g, '|p')
      .replace(/'/g, "|'")
  )
}
