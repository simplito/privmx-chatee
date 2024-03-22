import { useCallback, useEffect, useState } from 'react';
import { Endpoint } from '../endpoint-api/endpoint';
import { FormStatus } from '@/shared/utils/types';
import { ThreadInfo } from '../endpoint-api/types/thread';
import { useUserContext } from '@/shared/ui/context/UserContext';
import { EndpointEventTypes } from '../endpoint-api/types/events';
import { useEndpointEvent } from '@/shared/hooks/useEndpointEvent';
import { ThreadName } from './useThreadCreate';

export const THREADS_PER_PAGE = 100;

export default function useThreadList(options?: { sortBy?: 'newest-message' | 'name' }) {
    const [status, setStatus] = useState<FormStatus>('loading');
    const [threads, setThreads] = useState<ThreadInfo[]>([]);
    const {
        state: { contextId }
    } = useUserContext();
    const [startIndex, setStartIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true); // New state to track if more threads can be loaded

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

    return {
        threads,
        getThreadList,
        status,
        setStartIndex,
        startIndex,
        hasMore
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
