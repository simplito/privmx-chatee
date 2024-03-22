import { Deferred } from '@/shared/utils/deferred';
import { EndpointApiInterface } from './types/endpointApiInterface';

export declare class serviceFactory {
    static createEndpoint: () => Promise<EndpointApiInterface>;
}

let endpointDeferred: Deferred<EndpointApiInterface> | null = null;
export async function getEndpoint(): Promise<EndpointApiInterface> {
    if (!endpointDeferred) {
        endpointDeferred = new Deferred();
        let attemptId = 0;
        while (typeof serviceFactory === 'undefined' && attemptId++ < 50) {
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
        endpointDeferred.resolve(await serviceFactory.createEndpoint());
    }
    return endpointDeferred.promise;
}
