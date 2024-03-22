'use client';
import { ThreadClient } from '@/lib/clients/ThreadClient';
import { ReactNode, createContext, useContext, useMemo } from 'react';

const threadContext = createContext<{ id: string | undefined; title: string | undefined }>({
    id: '',
    title: ''
});

export function useThreadContext() {
    const ctx = useContext(threadContext);

    const chatClient = useMemo(
        () => new ThreadClient({ title: ctx.title, id: ctx.id }),
        [ctx.title, ctx.id]
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
