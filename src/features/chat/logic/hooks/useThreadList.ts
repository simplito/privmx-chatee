import { useCallback, useEffect, useState } from 'react';
import { Endpoint, StoreClient } from '@simplito/privmx-endpoint-web-sdk';
import { FormStatus } from '@/shared/utils/types';
import { ThreadInfo } from '@simplito/privmx-endpoint-web-sdk';
import { useUserContext } from '@/shared/ui/context/UserContext';
import { EndpointEventTypes } from '@simplito/privmx-endpoint-web-sdk';
import { useEndpointEvent } from '@/shared/hooks/useEndpointEvent';
import { readLastReadFile, toChatInfo } from '../clients/utils';
import { LastReadMessageFileContent } from './useThreadCreate';
import { ChangeEventType, ThreadMessageCache } from '../clients/ThreadMessageCache';
import { useThreadContext } from '..';
import { ThreadBindingData } from '@chat/data';

export const THREADS_PER_PAGE = 100;

export interface ThreadWithReadInfo extends ThreadInfo {
    lastReadMessageDate: number | null;
    metadataFileId: string;
}

export function useThreadList(
    // eslint-disable-next-line no-unused-vars
    navigate: (threadId: string | undefined, threadTitle: string) => void
) {
    const [status, setStatus] = useState<FormStatus>('loading');
    const threadClient = useThreadContext();
    const [threads, setThreads] = useState<ThreadWithReadInfo[]>([]);
    const {
        state: { contextId, username }
    } = useUserContext();
    const [startIndex, setStartIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const getThreadList = useCallback(
        async (contextId: string, startIndex: number) => {
            const threadCache = ThreadMessageCache.getInstance();

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

                const threadsWithUnread = await Promise.all(
                    threadList.threads.map(async (thread) => {
                        try {
                            const { userMetadata } = toChatInfo(thread.data.title);
                            if (!userMetadata) {
                                return null;
                            } else {
                                const userFile = userMetadata.find(
                                    (file) => file.username === username
                                );
                                if (!userFile) {
                                    return null;
                                }
                                const { streamReader, mimetype, name } = await StoreClient.readFile(
                                    userFile.fileId
                                );

                                while (await streamReader.readNextChunk()) {}

                                const date: LastReadMessageFileContent = readLastReadFile({
                                    data: streamReader.data,
                                    mimetype: mimetype,
                                    name
                                });

                                threadCache.updateReadMessageData(thread.threadId, {
                                    lastReadMessageDate: date.lastReadMessageDate,
                                    lastThreadMessageDate: thread.lastMsgDate
                                });
                                return {
                                    ...thread,
                                    lastReadMessageDate: date.lastReadMessageDate,
                                    metadataFileId: userFile.fileId
                                };
                            }
                        } catch (e) {
                            console.log(e);
                            return null;
                        }
                    })
                );

                const filteredThreadsWithUnread = threadsWithUnread.filter(
                    (thread) => thread !== null
                );

                subscribeToThreads(threadList.threads);
                setHasMore(threadList.threads.length === THREADS_PER_PAGE);

                if (startIndex === 0) {
                    setThreads(filteredThreadsWithUnread);
                } else {
                    setThreads((prev) => [...filteredThreadsWithUnread, ...prev]);
                }

                setStatus('success');
            } catch (e) {
                setStatus('error');
            }
        },
        [hasMore, username]
    );

    useEffect(() => {
        getThreadList(contextId, 0);
    }, [contextId, getThreadList]);

    function updateThreadList(threadInfo: ThreadInfo) {
        setThreads((prev) => {
            const createDate = threadInfo.createDate;
            const { userMetadata } = toChatInfo(threadInfo.data.title);
            const userFile = userMetadata.find((file) => file.username === username);

            const newThread: ThreadWithReadInfo = {
                ...threadInfo,
                metadataFileId: userFile.fileId,
                lastReadMessageDate: createDate,
                lastMsgDate: Date.now()
            };

            const newThreads = [newThread, ...prev];
            return newThreads;
        });
        subscribeToThreads([threadInfo]);
    }

    useEndpointEvent(EndpointEventTypes.THREAD_CREATED, (event) => {
        updateThreadList(event.data);
    });

    useEffect(() => {
        const unsubscribe = ThreadMessageCache.getInstance().subscribe((event) => {
            if (event.type === ChangeEventType.THREAD_READ_STATE) {
                setThreads((prevThreads) => {
                    return prevThreads.map((prevThread) => {
                        if (prevThread.threadId === event.data.threadId) {
                            return {
                                ...prevThread,
                                lastReadMessageDate: event.data.newLastReadDate,
                                lastMsgDate: event.data.newLastMessageDate
                            };
                        } else {
                            return prevThread;
                        }
                    });
                });
            }
        });

        return unsubscribe;
    }, []);

    useEndpointEvent(EndpointEventTypes.THREAD_DELETED, async (event) => {
        setThreads((prev) => {
            const newThreads = prev.filter((item) => item.threadId !== event.data.threadId);
            return newThreads;
        });

        if (threadClient.threadId === event.data.threadId) {
            navigate(undefined, '');
        }
    });

    useEndpointEvent(EndpointEventTypes.THREAD_NEW_MESSAGE, async (event) => {
        setThreads((prevThreads) => {
            return prevThreads.map((prevThread) => {
                if (prevThread.threadId === event.data.threadId) {
                    if (event.data.author === username) {
                        const threadCache = ThreadMessageCache.getInstance();
                        threadCache.updateReadMessageData(event.data.threadId, {
                            lastReadMessageDate: event.data.data.date,
                            lastThreadMessageDate: event.data.data.date
                        });
                        return {
                            ...prevThread,
                            lastReadMessageDate: event.data.data.date,
                            lastMsgDate: event.data.data.date
                        };
                    }
                    return { ...prevThread, lastMsgDate: event.data.data.date };
                } else {
                    return prevThread;
                }
            });
        });
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
            const { storeId } = JSON.parse(thread.data.title) as ThreadBindingData;

            await endpoint.subscribeToChannel(`thread2/${thread.threadId}/messages`);
            await endpoint.subscribeToChannel(`store/${storeId}/files`);
        } catch (e) {
            console.error(e);
        }
    });
}
