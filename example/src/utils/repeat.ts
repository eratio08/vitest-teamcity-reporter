const separator = '@';
export const repeat = (count: number, callback: (index: number) => void) =>  separator
    .repeat(count)
    .split(separator)
    .map((_, index) => callback(index))
