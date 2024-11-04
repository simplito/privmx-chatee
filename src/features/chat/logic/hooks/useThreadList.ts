import { useCallback, useEffect, useState } from 'react';
import { FormStatus } from '@/shared/utils/types';
import { useThreadContext } from '..';
import { useApp, useChatSystem } from '@srs/ReactBindings';
import { ThreadResourceEvent } from '@srs/ThreadResourceEvent';
import { Chat, ChatWithReadState } from '@chat/logic';

export const THREADS_PER_PAGE = 100;

export function useThreadList(navigate: (chat: Chat) => void) {
    const [status, setStatus] = useState<FormStatus>('loading');

    const chatSystem = useChatSystem();
    const app = useApp();

    const threadClient = useThreadContext();
    const [threads, setThreads] = useState<Chat[]>([]);

    const [startIndex, setStartIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const getThreadList = useCallback(
        async (page: number = 0) => {
            if (!hasMore) {
                return;
            }
            try {
                setStatus('loading');
                const { chats, hasMoreChats } = await chatSystem.getChatList(page);
                setHasMore(hasMoreChats);

                const chatsWithReadState: ChatWithReadState[] = [];
                if (startIndex === 0) {
                    setThreads(chats);
                } else {
                    setThreads((prev) => [...chatsWithReadState, ...prev]);
                }

                setStatus('success');
            } catch (e) {
                console.error(e);
                setStatus('error');
            }
        },
        [hasMore, startIndex, chatSystem]
    );

    useEffect(() => {
        getThreadList();
    }, [getThreadList]);

    async function updateThreadList(threadInfo: Chat) {
        setThreads((prev) => {
            const newThreads = [threadInfo, ...prev];
            return newThreads;
        });
    }

    useEffect(() => {
        const s = ThreadResourceEvent.createSubscriber('created', (chat) => {
            updateThreadList(chat.payload);
        });
        s.add('deleted', (chat) => {
            setThreads((prev) => {
                const newThreads = prev.filter((item) => item.chatId !== chat.payload.threadId);
                return newThreads;
            });

            if (threadClient.chatId === chat.payload.threadId) {
                navigate(null);
            }
        });

        const unsubThread = app.eventBus.registerSubscriber(s);

        return () => {
            unsubThread();
        };
    }, [app.eventBus, threadClient?.chatId, navigate]);

    const deleteThread = useCallback(
        async (threadId: string) => {
            const thread = threads.find((thread) => thread.chatId === threadId);

            if (!thread) {
                return;
            }
            setThreads((prev) => {
                const newThreads = prev.filter((item) => item.chatId !== thread.chatId);
                return newThreads;
            });
            await chatSystem.deleteChat(threadId);
        },
        [chatSystem, threads]
    );

    return {
        threads,
        getThreadList,
        status,
        setStartIndex,
        startIndex,
        hasMore,
        deleteThread
    };
}
