import { useState } from 'react';
import { Endpoint } from '../endpoint-api/endpoint';
import { FormStatus } from '@/shared/utils/types';
import { UserWithPubKey } from '../endpoint-api/types/user';
import { threadUsers } from '@modals/create-chat-modal/CreateChatModal';

export interface MessageInfo {
    lastReadMessageId: string | null;
}
export interface ThreadName {
    name: string;
    storeId: string;
}

const defaultFileContent: MessageInfo = { lastReadMessageId: null };

export default function useThreadCreate() {
    const [status, setStatus] = useState<FormStatus>('default');

    async function createThread(contextId: string, users: threadUsers[], title: string) {
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

            // for (let i = 0; i < allUsers.length; i++) {
            //     await endpoint.storeFileCreate(storeId, {
            //         mimetype: 'text/plain',
            //         name: `.${allUsers[i].userId}`,
            //         data: new TextEncoder().encode(JSON.stringify(defaultFileContent)),
            //         size: JSON.stringify(defaultFileContent).length
            //     });
            // }

            await endpoint.threadCreate(
                contextId,
                allUsers,
                managers,
                JSON.stringify({ name: title, storeId: storeId })
            );

            // const threadBindingData = JSON.stringify({ name: title, threadId });

            // await endpoint.storeFileCreate(storeId, {
            //     mimetype: 'text/plain',
            //     name: `.threadBinding`,
            //     data: new TextEncoder().encode(JSON.stringify(threadBindingData)),
            //     size: JSON.stringify(threadBindingData).length
            // });

            setStatus('success');
        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    }

    return {
        createThread,
        status
    };
}
