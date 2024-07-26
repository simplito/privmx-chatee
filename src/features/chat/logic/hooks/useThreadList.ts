import { useCallback, useEffect, useState } from 'react';
import {
    EndpointEventTypes,
    Platform,
    StoreClient,
    ThreadInfo
} from '@simplito/privmx-endpoint-web-sdk';
import { FormStatus } from '@/shared/utils/types';
import { useUserContext } from '@/shared/ui/context/UserContext';
import { useEndpointEvent } from '@/shared/hooks/useEndpointEvent';
import { readLastReadFile, toChatInfo } from '../clients/utils';
import { LastReadMessageFileContent } from './useThreadCreate';
import { ChangeEventType, ThreadMessageCache } from '../clients/ThreadMessageCache';
import { useThreadContext } from '..';
import { ThreadBindingData } from '@chat/data';
import { usePlatformContext } from '@/shared/hooks/usePlatformContext';
import { DecryptedChatMessage } from '@chat/data/types/types';

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
        state: { username }
    } = useUserContext();
    const platformContext = usePlatformContext();
    const [startIndex, setStartIndex] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const getThreadList = useCallback(
        async (page: number = 0) => {
            if (!hasMore) {
                return;
            }
            try {
                setStatus('loading');
                const threadList = await platformContext.threads.list(page);
                const threadsWithUnread = await Promise.all(
                    threadList.threads.map((thread) => getThreadUnreadData(thread, username))
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
        [hasMore, username, platformContext, startIndex]
    );

    useEffect(() => {
        getThreadList();
    }, [getThreadList]);

    async function updateThreadList(threadInfo: ThreadInfo) {
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
        await subscribeToThreads([threadInfo]);
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

        return () => unsubscribe();
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

    useEndpointEvent(EndpointEventTypes.DECODED_NEW_MESSAGE, async (event) => {
        const message = event.data as unknown as DecryptedChatMessage;
        setThreads((prevThreads) => {
            return prevThreads.map((prevThread) => {
                if (prevThread.threadId === message.info.threadId) {
                    if (message.privateMeta.author.userId === username) {
                        const threadCache = ThreadMessageCache.getInstance();
                        threadCache.updateReadMessageData(message.info.threadId, {
                            lastReadMessageDate: message.privateMeta.createDate,
                            lastThreadMessageDate: message.privateMeta.createDate
                        });
                        return {
                            ...prevThread,
                            lastReadMessageDate: message.privateMeta.createDate,
                            lastMsgDate: message.privateMeta.createDate
                        };
                    }
                    return { ...prevThread, lastMsgDate: message.privateMeta.createDate };
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

            await platformContext.thread(thread.threadId).delete();

            setThreads((prev) => {
                const newThreads = prev.filter((item) => item.threadId !== thread.threadId);
                return newThreads;
            });
            await platformContext.store(threadBinding.storeId).delete();
        },
        [threads, platformContext]
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

async function subscribeToThreads(threadsList: ThreadInfo[]) {
    const con = Platform.connection();

    threadsList.forEach(async (thread) => {
        try {
            const { storeId } = JSON.parse(thread.data.title) as ThreadBindingData;
            await con.channel(`thread2/${thread.threadId}/messages`);
            await con.channel(`store/${storeId}/files`);
        } catch (e) {
            console.error(e);
        }
    });
}
const getThreadUnreadData = async (thread: ThreadInfo, username: string) => {
    const threadCache = ThreadMessageCache.getInstance();
    try {
        const { userMetadata } = toChatInfo(thread.data.title);
        if (!userMetadata) {
            return null;
        } else {
            const userFile = userMetadata.find((file) => file.username === username);
            if (!userFile) {
                return null;
            }
            const { streamReader, mimetype, name } = await StoreClient.readFile(userFile.fileId);

            while (await streamReader.readNextChunk()) {}

            await streamReader.close();

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
        return null;
    }
};
