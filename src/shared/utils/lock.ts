import { Deferred } from './deferred';

export class Lock {
    private deferred: Deferred<void> = new Deferred<void>();

    constructor() {
        this.deferred.resolve();
    }

    async withLock<T>(func: () => Promise<T>): Promise<T> {
        const deferred = await this.obtain();
        try {
            return await func();
        } finally {
            deferred.resolve();
        }
    }

    private async obtain() {
        const oldDeferred = this.deferred;
        const newDeferred = new Deferred<void>();
        this.deferred = newDeferred;
        await oldDeferred.promise;
        return newDeferred;
    }
}
