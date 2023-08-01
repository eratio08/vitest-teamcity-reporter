export const delayPromise =  () => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        })
    })
}
