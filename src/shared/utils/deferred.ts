/* eslint-disable no-unused-vars */
export class Deferred<T> {
    private _promise: Promise<T>;
    private _resolve: (value: T) => void;
    private _reject: (error?: unknown) => void;

    get promise(): Promise<T> {
        return this._promise;
    }

    constructor() {
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    resolve(value: T): void {
        this._resolve(value);
    }

    reject(error?: unknown): void {
        this._reject(error);
    }
}
