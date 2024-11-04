'use client';
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react';
import { useThreadContext } from './useThreadContext';
import { useChatStateMachine } from '..';
import type { Event } from './useChatStateMachine/types';
import { useApp, useMessagesSystem } from '@srs/ReactBindings';
import { MessageResourceEvent } from '@chat/logic/messages-system/MessageResourceEvent';

export function useThreadMessageActions(currentChatId: string, send: Dispatch<Event>) {
    const messageSystem = useMessagesSystem();

    const sendMessage = useCallback(
        async (msg: { text: string }) => {
            if (!currentChatId) return;
            const newMessage = messageSystem.createPendingTextMessage(currentChatId, msg.text);
            send({
                type: 'NEW_MESSAGE',
                newMessage: newMessage
            });
            await messageSystem.sendMessage({
                mimetype: 'text',
                text: newMessage.text,
                pendingId: newMessage.pendingId,
                chatId: newMessage.chatId
            });
        },
        [currentChatId, send, messageSystem]
    );

    const sendFileMessage = useCallback(
        async (msg: { file: File }) => {
            if (!currentChatId) return;

            const fileMsg = messageSystem.createPendingFileMessage(currentChatId, msg.file);
            send({
                type: 'NEW_MESSAGE',
                newMessage: fileMsg
            });
            await messageSystem.sendMessage({
                mimetype: 'file',
                file: msg.file,
                chatId: currentChatId,
                pendingId: fileMsg.pendingId
            });
        },
        [currentChatId, send, messageSystem]
    );

    const deleteMessage = useCallback(
        async (messageId: string, threadId: string) => {
            if (!messageId || !threadId) {
                return;
            }
            await messageSystem.deleteMessage(messageId);
            send({
                type: 'DELETE_MESSAGE',
                deletedMessage: { messageId, chatId: threadId }
            });
        },
        [send, messageSystem]
    );

    return { sendFileMessage, sendMessage, deleteMessage };
}

export function useThreadMessageContext() {
    const chatClient = useThreadContext();
    const currentThreadId = chatClient?.chatId || '';

    const app = useApp();

    const mounted = useRef<boolean>(false);

    const messageSystem = useMessagesSystem();

    useEffect(() => {
        mounted.current = true;

        return () => {
            mounted.current = false;
        };
    }, []);

    const [state, send] = useChatStateMachine();
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [totalMessages, setTotalMessages] = useState(0);
    const actions = useThreadMessageActions(currentThreadId, send);
    const [currentPage, setCurrentPage] = useState(0);

    const loadMessages = useCallback(
        async (id?: string | undefined) => {
            const fetchId = id ? id : currentThreadId;

            if (!fetchId) return;

            const messages = await messageSystem.getPageMessages(fetchId, currentPage);
            setHasMoreMessages(messages.hasMoreMessages);
            setTotalMessages(messages.total);
            if (mounted.current) {
                send({
                    type: 'SETTLE',
                    newMessages: messages.messages
                });
            }
        },
        [currentThreadId, currentPage, messageSystem, send]
    );

    useEffect(() => {
        const messageSubscriber = MessageResourceEvent.createSubscriber('new', (newMessage) => {
            if (newMessage.payload.chatId !== currentThreadId) return;
            send({
                type: 'SETTLE_MESSAGE',
                newMessage: newMessage.payload
            });
        });
        messageSubscriber.add('deleted', (deletedMessage) => {
            send({
                type: 'DELETE_MESSAGE',
                deletedMessage: {
                    messageId: deletedMessage.payload.messageId,
                    chatId: deletedMessage.payload.chatId
                }
            });
        });
        const unregister = app.eventBus.registerSubscriber(messageSubscriber);

        return () => {
            unregister();
        };
    }, [app.eventBus, currentThreadId, send]);

    useEffect(() => {
        if (!currentThreadId) {
            return;
        }
        send({
            type: 'INITIALIZE',
            effect: () => loadMessages()
        });
    }, [send, chatClient, currentThreadId, loadMessages]);

    async function requestNextMessageFrame() {
        if (currentThreadId && hasMoreMessages) {
            setCurrentPage((current) => current + 1);
            send({
                type: 'FETCH_NEXT_PAGE'
            });
            const messagesList = await messageSystem.getPageMessages(
                currentThreadId,
                currentPage + 1
            );
            if (mounted.current && messagesList) {
                send({
                    type: 'SETTLE',
                    newMessages: messagesList.messages
                });
            }
        }
    }

    return {
        ...state,
        messages: [...(state.messages || []), ...(state.pendingMessages || [])],
        requestNextMessageFrame,
        hasMoreMessages,
        allMessagesLength: totalMessages,
        ...actions
    };
}

export type ThreadMessageContext = ReturnType<typeof useThreadMessageContext>;
