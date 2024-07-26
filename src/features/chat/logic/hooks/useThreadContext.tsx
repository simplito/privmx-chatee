'use client';
import { ReactNode, createContext, useContext, useMemo } from 'react';
import { ChatClient } from '..';
import { usePlatformContext } from '@/shared/hooks/usePlatformContext';

const threadContext = createContext<{ id: string | undefined; title: string | undefined }>({
    id: '',
    title: ''
});

export function useThreadContext() {
    const ctx = useContext(threadContext);
    const platformCtx = usePlatformContext();
    const chatClient = useMemo(
        () => new ChatClient({ title: ctx.title, id: ctx.id, contextId: platformCtx.contextId() }),
        [ctx.title, ctx.id, platformCtx]
    );

    return chatClient;
}

export function ThreadContextProvider({
    id,
    children,
    title
}: {
    id: undefined | string;
    title: undefined | string;
    children: ReactNode;
}) {
    return <threadContext.Provider value={{ id, title }}>{children}</threadContext.Provider>;
}
