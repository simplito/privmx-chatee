'use client';
import { createContext, ReactNode, useContext } from 'react';

import { Chat } from '@chat/logic/chat-system/types';

const threadContext = createContext<Chat | null>({
    chatId: '',
    contextId: '',
    creationDate: 0,
    creator: '',
    lastMessageDate: 0,
    managers: [],
    storeId: '',
    title: '',
    users: []
});

export function useThreadContext() {
    const ctx = useContext(threadContext);

    return ctx;
}

export function ThreadContextProvider({ chat, children }: { chat: Chat; children: ReactNode }) {
    return <threadContext.Provider value={chat}>{children}</threadContext.Provider>;
}
