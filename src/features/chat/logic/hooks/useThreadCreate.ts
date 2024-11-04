import { useState } from 'react';
import { FormStatus } from '@/shared/utils/types';
import { useChatSystem } from '@srs/ReactBindings';
import { ThreadUsers } from '@chat/logic';

export interface LastReadMessageFileContent {
    lastReadMessageDate: number;
}

export function useThreadCreate() {
    const [status, setStatus] = useState<FormStatus>('default');

    const c = useChatSystem();

    async function createThread(users: ThreadUsers[], title: string) {
        try {
            setStatus('loading');
            const chat = await c.createChat(title, users);
            setStatus('success');
            return chat;
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
