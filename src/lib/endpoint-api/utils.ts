import { ACCESS_KEY_ID, ACCESS_KEY_SECRET, API_URL } from '@/shared/utils/env';

export async function addUserToContext(userId: string, pubKey: string, contextId: string) {
    const accessToken = await getAccessToken();
    const requestBody = {
        jsonrpc: '2.0',
        id: 128,
        method: 'context/addUserToContext',
        params: {
            contextId: contextId,
            userId,
            userPubKey: pubKey
        }
    };

    const addToContextRequest = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody)
    });

    const response = await addToContextRequest.json();

    if ('error' in response) {
        console.error(response.error);
        throw new Error('Unable to register user in context');
    }

    if (addToContextRequest.status === 200) {
        return;
    }

    throw new Error('Error adding user to context');
}

async function getAccessToken() {
    const requestBody = {
        jsonrpc: '2.0',
        id: 128,
        method: 'manager/auth',
        params: {
            scope: ['solution:*', 'context'],
            grantType: 'api_key_credentials',
            apiKeyId: ACCESS_KEY_ID,
            apiKeySecret: ACCESS_KEY_SECRET
        }
    };

    const tokenRequest = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    const response = await tokenRequest.json();

    if ('error' in response) {
        console.error(response.error);
        throw new Error('Unable to get access token');
    }

    if (tokenRequest.status === 200) {
        return response.result.accessToken;
    }

    throw new Error('Error getting access token');
}
