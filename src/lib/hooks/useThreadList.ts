import { useCallback, useEffect, useState } from 'react';
import { Endpoint, ThreadInfo } from '@privmx/endpoint-web';
import { FormStatus } from '@/shared/utils/types';
import { useUserContext } from '@/shared/ui/context/UserContext';
import { EndpointEventTypes } from '@privmx/endpoint-web';
import { useEndpointEvent } from '@/shared/hooks/useEndpointEvent';
import { ThreadName } from './useThreadCreate';
import { toChatInfo } from '../clients/utils';
import { useThreadContext } from '@chat';

export const THREADS_PER_PAGE = 100;

export default function useThreadList(
    // eslint-disable-next-line no-unused-vars
    navigate: (threadId: string | undefined, threadTitle: string) => void
) {
    const [status, setStatus] = useState<FormStatus>('loading');
    const threadClient = useThreadContext();
    const [threads, setThreads] = useState<ThreadInfo[]>([]);
    const {
        state: { contextId }
    } = useUserContext();
    const [startIndex, setStartIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const getThreadList = useCallback(
        async (contextId: string, startIndex: number) => {
            if (!hasMore) {
                return;
            }
            try {
                setStatus('loading');
                const endpoint = await Endpoint.getInstance();
                const threadList = await endpoint.threadList(
                    contextId,
                    startIndex,
                    THREADS_PER_PAGE,
                    'desc'
                );
                if (startIndex === 0) {
                    setThreads(threadList.threads);
                } else {
                    setThreads((prev) => [...threadList.threads, ...prev]);
                }
                subscribeToThreads(threadList.threads);
                setHasMore(threadList.threads.length === THREADS_PER_PAGE);

                setStatus('success');
            } catch (e) {
                setStatus('error');
            }
        },
        [hasMore]
    );

    useEffect(() => {
        getThreadList(contextId, 0);
    }, [contextId, getThreadList]);

    function updateThreadList(threadInfo: ThreadInfo) {
        setThreads((prev) => {
            const newThreads = [threadInfo, ...prev];
            return newThreads;
        });
        subscribeToThreads([threadInfo]);
    }

    useEndpointEvent(EndpointEventTypes.THREAD_CREATED, (event) => {
        updateThreadList(event.data);
    });

    useEndpointEvent(EndpointEventTypes.THREAD_DELETED, async (event) => {
        setThreads((prev) => {
            const newThreads = prev.filter((item) => item.threadId !== event.data.threadId);
            return newThreads;
        });

        if (threadClient.threadId === event.data.threadId) {
            navigate(undefined, '');
        }
    });

    const deleteThread = useCallback(
        async (threadId: string) => {
            const thread = threads.find((thread) => thread.threadId === threadId);

            if (!thread) {
                return;
            }
            const threadBinding = toChatInfo(thread.data.title);
            const endpoint = await Endpoint.getInstance();
            await endpoint.threadDelete(thread.threadId);

            setThreads((prev) => {
                const newThreads = prev.filter((item) => item.threadId !== thread.threadId);
                return newThreads;
            });

            endpoint.storeDelete(threadBinding.storeId);
        },
        [threads]
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

async function subscribeToThreads(threads: ThreadInfo[]) {
    const endpoint = await Endpoint.getInstance();

    threads.forEach(async (thread) => {
        try {
            const { storeId } = JSON.parse(thread.data.title) as ThreadName;

            await endpoint.subscribeToChannel(`thread2/${thread.threadId}/messages`);
            await endpoint.subscribeToChannel(`store/${storeId}/files`);
        } catch (e) {
            console.error(e);
        }
    });
}
