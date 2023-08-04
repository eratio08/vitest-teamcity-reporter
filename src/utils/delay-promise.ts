export const delayPromise = async(time: number = 0): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}
