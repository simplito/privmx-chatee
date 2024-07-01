import { CLOUD_URL, ACCESS_KEY } from '@/shared/utils/env';
import { Endpoint } from '@simplito/privmx-endpoint-web-sdk';
import { splitStringInHalf } from '@/shared/utils/string';
import { getSigHeader } from '@utils/crypto';

export async function addUserToContext(userId: string, pubKey: string, contextId: string) {
    const requestBody = {
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
    };

    const addToContextRequest = await fetch(CLOUD_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Access-Sig': await getSigHeader(requestBody)
        },
        body: JSON.stringify(requestBody)
    });

    if (addToContextRequest.status === 200) {
        return;
    }

    throw new Error('Error adding user to context');
}

export type createContextResponse =
    | {
          jsonrpc: string;
          id: number;
          result: { contextId: string };
      }
    | {
          jsonrpc: '2.0';
          id: 0;
          error: { code: number; message: string; data: null };
      };

export const generateEndpointKeyPair = async (string: string) => {
    const endpoint = await Endpoint.getInstance();

    const [salt, password] = splitStringInHalf(string);

    const privateKey = await endpoint.cryptoPrivKeyNewPbkdf2(salt, password);
    const publicKey = await endpoint.cryptoPubKeyNew(privateKey);

    return {
        privateKey,
        publicKey
    };
};
