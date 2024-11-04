export async function dummyReqest<T>(returnValue: T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const isValid = Math.random();
        setTimeout(() => {
            if (isValid < 0.1) {
                console.info('invalid');
                reject();
            } else {
                console.info('valid');
                resolve(returnValue);
            }
        }, 2000);
    });
}

export async function serverDelay(time: number) {
    return new Promise((resolv) => setTimeout(resolv, time));
}
