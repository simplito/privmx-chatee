import { createContextResponse } from '@/lib/endpoint-api/utils';
import { CLOUD_URL, CLOUD_DEV_TOKEN, SOLUTION_ID } from '@/shared/utils/env';

export async function createCloudContext(name: string) {
    try {
        const addToContextRequest = await fetch(CLOUD_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Developer-Token': CLOUD_DEV_TOKEN
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 0,
                method: 'context/createContext',
                params: {
                    solutionId: SOLUTION_ID,
                    profile: { name, description: '', scope: 'private' }
                }
            })
        });

        const body: createContextResponse = await addToContextRequest.json();

        if ('error' in body) {
            console.error('[ERROR] Unable to create cloud context bad request: ', body);
            throw new Error('[ERROR] Unable to create cloud context bad request:');
        }

        if (body.result.contextId) {
            return body.result.contextId;
        } else {
            console.error('[ERROR] Unable to create cloud context bad request: ', body);
            throw new Error('[ERROR] Unable to create cloud context bad request:');
        }
    } catch (error) {
        console.error('[ERROR] Unable to create cloud context: ', error);
        throw new Error('[ERROR] Unable to create cloud context:');
    }
}
