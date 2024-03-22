import { CLOUD_URL, CLOUD_DEV_TOKEN, SOLUTION_ID } from '@/shared/utils/env';

export async function addUserToContext(userId: string, pubKey: string, contextId: string) {
    const addToContextRequest = await fetch(CLOUD_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Member-Token': CLOUD_DEV_TOKEN
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 0,
            method: 'context/addUserToContext',
            params: {
                contextId: contextId,
                user: {
                    userId,
                    pubKey
                }
            }
        })
    });

    if (addToContextRequest.status === 200) {
        return;
    }

    throw new Error('Error adding user to context');
}

export interface createContextResponse {
    jsonrpc: string;
    id: number;
    result: { contextId: string };
}
export async function createCloudContext(name: string) {
    const addToContextRequest = await fetch(CLOUD_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Member-Token': CLOUD_DEV_TOKEN
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

    if (addToContextRequest.status === 200) {
        const body: createContextResponse = await addToContextRequest.json();
        return body.result.contextId;
    }

    throw new Error('Error creating context');
}
