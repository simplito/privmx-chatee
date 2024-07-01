import { useState } from 'react';
import { Endpoint, UserWithPubKey } from '@simplito/privmx-endpoint-web-sdk';
import { FormStatus } from '@/shared/utils/types';
import { ThreadUsers, UserMetadata } from '@chat/data';
import { createNewMetaFile } from '../clients/utils';

export interface LastReadMessageFileContent {
    lastReadMessageDate: number;
}

const defaultFileContent: LastReadMessageFileContent = { lastReadMessageDate: 0 };

export function useThreadCreate() {
    const [status, setStatus] = useState<FormStatus>('default');

    async function createThread(contextId: string, users: ThreadUsers[], title: string) {
        try {
            setStatus('loading');
            const endpoint = await Endpoint.getInstance();
            const allUsers: UserWithPubKey[] = users.map((user) => {
                return {
                    userId: user.userId,
                    pubKey: user.publicKey
                };
            });

            const managers: UserWithPubKey[] = users
                .filter((user) => user.isAdmin)
                .map((user) => {
                    return {
                        userId: user.userId,
                        pubKey: user.publicKey
                    };
                });

            const storeId = await endpoint.storeCreate(contextId, allUsers, managers, title);
            const userMetadata: UserMetadata[] = [];
            for (let i = 0; i < allUsers.length; i++) {
                const fileId = await createNewMetaFile(
                    allUsers[i].userId,
                    defaultFileContent,
                    storeId
                );

                userMetadata.push({
                    username: allUsers[i].userId,
                    fileId
                });
            }

            const threadMetadata = JSON.stringify({ name: title, storeId: storeId, userMetadata });
            const threadId = await endpoint.threadCreate(
                contextId,
                allUsers,
                managers,
                threadMetadata
            );

            setStatus('success');
            return {
                id: threadId,
                name: threadMetadata
            };
        } catch (e) {
            console.error(e);
            setStatus('error');
            return null;
        }
    }

    return {
        createThread,
        status
    };
}
