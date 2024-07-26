import { useState } from 'react';
import { FormStatus } from '@/shared/utils/types';
import { ThreadUsers } from '@chat/data';
import { usePlatformContext } from '@/shared/hooks/usePlatformContext';
import { ChatClient } from '..';

export interface LastReadMessageFileContent {
    lastReadMessageDate: number;
}

export function useThreadCreate() {
    const [status, setStatus] = useState<FormStatus>('default');

    const platformContext = usePlatformContext();

    async function createThread(users: ThreadUsers[], title: string) {
        try {
            setStatus('loading');
            const chatClient = await ChatClient.newChat(platformContext, users, title);

            setStatus('success');
            return {
                id: chatClient.threadId,
                name: JSON.stringify(chatClient.chatInfo)
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
