'use client';
import { useCallback, useEffect, useRef } from 'react';
import { useThreadContext } from './useThreadContext';
import { useChatStateMachine } from './useChatStateMachine/useChatStateMachine';
import { useEndpointEvent } from '@/shared/hooks/useEndpointEvent';
import { EndpointEventTypes } from '@/lib/endpoint-api/types/events';

export function useThreadMessageContext() {
    const chatClient = useThreadContext();
    const currentThreadId = chatClient.threadId;

    const mounted = useRef<boolean>(false);

    useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;
        };
    }, []);

    const [state, send] = useChatStateMachine();

    const loadMessages = useCallback(
        async (id?: string | undefined) => {
            const fetchId = id ? id : currentThreadId;

            if (!fetchId) return;

            const messages = await chatClient.loadMessages(fetchId);
            if (mounted.current) {
                send({
                    type: 'SETTLE',
                    newMessages: messages
                });
            }
        },
        [chatClient, currentThreadId, send]
    );

    useEndpointEvent(EndpointEventTypes.THREAD_NEW_MESSAGE, (e) => {
        chatClient.loadNewMessage(currentThreadId, e.data);
        send({
            type: 'SETTLE_MESSAGE',
            newMessage: {
                ...e.data,
                msgId: e.data.data.msgId,
                threadId: e.data.messageId
            }
        });
    });

    useEndpointEvent(EndpointEventTypes.THREAD_DELETED_MESSAGE, async (e) => {
        chatClient.deleteMessageInCache(e.data.messageId, e.data.threadId);
        send({
            type: 'DELETE_MESSAGE',
            deletedMessage: { msgId: e.data.messageId, threadId: e.data.threadId }
        });
    });

    useEffect(() => {
        if (!currentThreadId) {
            return;
        }
        const currentMessages = chatClient.getMessages();
        if (chatClient.hasMessages) {
            send({
                type: 'START_FETCHING',
                newMessages: currentMessages,
                effect: () => loadMessages()
            });
        } else {
            send({
                type: 'INITIALIZE',
                effect: () => loadMessages()
            });
        }
    }, [send, chatClient, currentThreadId, loadMessages]);

    const hasMoreMessages = chatClient.hasMoreMessages();
    const allMessagesLength = chatClient.getThreadMessageTotal(currentThreadId);

    async function requestNextMessageFrame() {
        if (currentThreadId && hasMoreMessages) {
            send({
                type: 'FETCH_NEXT_PAGE'
            });
            const messages = await chatClient.loadNextMessagesPage(currentThreadId);
            if (mounted.current && messages) {
                send({
                    type: 'SETTLE',
                    newMessages: messages
                });
            }
        }
    }

    const sendMessage = useCallback(
        async (msg: { author: string; text: string }) => {
            if (!currentThreadId) return;
            const newMsg = chatClient.createNewMessage(currentThreadId, msg);
            send({
                type: 'NEW_MESSAGE',
                newMessage: newMsg
            });
            await chatClient.sendTextMessage(newMsg);
        },
        [chatClient, currentThreadId, send]
    );

    const sendFileMessage = useCallback(
        async (msg: { author: string; file: File }) => {
            if (!currentThreadId) return;

            const fileMsg = chatClient.createFileMessage(currentThreadId, {
                author: msg.author,
                fileId: '',
                fileName: msg.file.name,
                fileMimeType: msg.file.type
            });
            send({
                type: 'NEW_MESSAGE',
                newMessage: fileMsg
            });
            await chatClient.sendFileMessage(fileMsg, msg.file);
        },
        [chatClient, currentThreadId, send]
    );

    const deleteMessage = useCallback(
        async (messageId: string, threadId: string) => {
            if (!messageId || !threadId) {
                return;
            }
            await chatClient.deleteMessage(messageId, threadId);
            send({
                type: 'DELETE_MESSAGE',
                deletedMessage: { msgId: messageId, threadId }
            });
        },
        [chatClient, send]
    );

    return {
        ...state,
        messages: [...(state.messages || []), ...(state.pendingMessages || [])],
        requestNextMessageFrame,
        hasMoreMessages,
        sendMessage,
        allMessagesLength,
        sendFileMessage,
        deleteMessage
    };
}

export type ThreadMessageContext = ReturnType<typeof useThreadMessageContext>;
