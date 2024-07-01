'use client';
import { ThreadMessage, ThreadMessagesList } from '@simplito/privmx-endpoint-web-sdk';
import { settleMessage, toChatMessage } from './utils';
import { ChatMessage } from '@chat/data';

export const PAGE_SIZE = 100;

export interface MessageRead {
    lastThreadMessageDate: number | null;
    lastReadMessageDate: number | null;
}

export enum ChangeEventType {
    // eslint-disable-next-line no-unused-vars
    THREAD_READ_STATE = 'thread_read_state'
}

type ChangeEvent = {
    type: ChangeEventType.THREAD_READ_STATE;
    data: {
        threadId: string;
        newLastReadDate: number;
        newLastMessageDate: number;
    };
};

export class ThreadMessageCache {
    private _messages: Map<string, ChatMessage[]> = new Map();
    private _messagesMetadata: Map<
        string,
        { messagesTotal: number; currentPage: number; pageCount: number; hasMoreMessages: boolean }
    > = new Map();
    private _readMessageData: Map<string, MessageRead> = new Map<string, MessageRead>();

    private static instance: ThreadMessageCache = null;

    // eslint-disable-next-line no-unused-vars
    private _listeners: Array<(event: ChangeEvent) => void> = [];

    // eslint-disable-next-line no-unused-vars
    public subscribe(listener: (event: ChangeEvent) => void) {
        this._listeners = [...this._listeners, listener];
        return () => {
            this._listeners = this._listeners.filter((l) => l !== listener);
        };
    }

    public getReadDataSnapshot() {
        return this._readMessageData;
    }

    private emitChange(event: ChangeEvent) {
        for (let listener of this._listeners) {
            listener(event);
        }
    }

    static getInstance(): ThreadMessageCache {
        if (!this.instance) {
            this.instance = new ThreadMessageCache();
            return this.instance;
        }
        return this.instance;
    }

    public pushMessage(threadId: string, msg: ChatMessage) {
        const messages = this._messages.get(threadId) || [];
        this._messages.set(threadId, [...messages, msg]);
    }

    public upsertMessage(threadId: string, newMessage: ThreadMessage) {
        if (this.hasThreadMetaData(threadId)) {
            this.pushMessage(threadId, toChatMessage(newMessage));
        } else {
            this._messages.set(threadId, [toChatMessage(newMessage)]);
        }
    }

    public getMessages(id?: string | undefined): ChatMessage[] | undefined {
        if (!id) return undefined;
        if (!this._messages.has(id)) {
            this._messages.set(id, []);
        }

        return this._messages.get(id) as ChatMessage[];
    }

    public getThreadMetaData(id?: string | undefined) {
        return this._messagesMetadata.get(id);
    }

    public hasThreadMetaData(id?: string | undefined) {
        return this._messagesMetadata.has(id);
    }

    public hasMessages(threadId: string | undefined) {
        return this._messages.has(threadId) && this._messages.get(threadId).length !== 0;
    }

    public getThreadMessageTotal(threadId: string) {
        if (!this._messagesMetadata.get(threadId)) return 0;
        return this._messagesMetadata.get(threadId).messagesTotal;
    }

    public updateMessage(msgId: string, threadMessageId: string, threadId: string) {
        if (this._messages.has(threadId)) {
            const messages = this._messages.get(threadId);
            const newMessages = settleMessage(messages, msgId, threadMessageId);
            this._messages.set(threadId, newMessages);

            const newestMessageDate = newMessages.at(-1)?.createDate || Date.now();

            this._readMessageData.set(threadId, {
                lastReadMessageDate: newestMessageDate,
                lastThreadMessageDate: newestMessageDate
            });

            this.emitChange({
                type: ChangeEventType.THREAD_READ_STATE,
                data: {
                    threadId: threadId,
                    newLastReadDate: newestMessageDate,
                    newLastMessageDate: newestMessageDate
                }
            });
        }
    }

    public deleteMessage(msgId: string, threadId: string) {
        if (this._messages.has(threadId)) {
            const messages = this._messages.get(threadId);
            const newMessages = messages.filter(
                (message) =>
                    message.status === 'pending' ||
                    (message.status === 'sent' && message.messageId !== msgId)
            );

            this._messages.set(threadId, newMessages);
        }
    }

    public setMessages(threadId: string, messagesList: ThreadMessagesList) {
        const newMessages: ChatMessage[] = messagesList.messages.map(toChatMessage);

        this._messages.set(threadId, newMessages);

        const currentPage = this._messagesMetadata.get(threadId)?.currentPage || 0;

        if (this._messagesMetadata.has(threadId)) {
            const metadata = this._messagesMetadata.get(threadId);
            metadata.hasMoreMessages = messagesList.messagesTotal > messagesList.messages.length;
            metadata.messagesTotal = messagesList.messagesTotal;
        } else {
            this._messagesMetadata.set(threadId, {
                messagesTotal: messagesList.messagesTotal,
                pageCount: Math.floor(messagesList.messagesTotal / PAGE_SIZE),
                currentPage: currentPage,
                hasMoreMessages: messagesList.messagesTotal > messagesList.messages.length
            });
        }

        return newMessages;
    }

    public loadNextMessagesPage(id: string | undefined): void {
        if (!id) return undefined;

        if (this._messagesMetadata.has(id)) {
            const metadata = { ...this.getThreadMetaData(id) };
            if (metadata.currentPage < metadata.pageCount) {
                metadata.currentPage = metadata.currentPage + 1;
            }

            this._messagesMetadata.set(id, metadata);
        }
    }

    public updateReadMessageData(threadId: string, messageData: Partial<MessageRead>): void {
        if (!threadId || !messageData) return;

        const current = this._readMessageData.get(threadId);

        const newMessageData = {
            ...current,
            ...messageData
        };

        this._readMessageData.set(threadId, newMessageData);

        if (messageData.lastReadMessageDate) {
            this.emitChange({
                type: ChangeEventType.THREAD_READ_STATE,
                data: {
                    threadId: threadId,
                    newLastReadDate: newMessageData.lastReadMessageDate,
                    newLastMessageDate: newMessageData.lastThreadMessageDate
                }
            });
        }
    }

    public getReadMessageData(id: string) {
        return this._readMessageData.get(id);
    }

    public isThreadRead(id: string) {
        const readMessageData = this._readMessageData.get(id);

        return (
            readMessageData?.lastReadMessageDate >= readMessageData?.lastThreadMessageDate || false
        );
    }

    public getLastReadMessageDate(threadId: string) {
        if (!this._readMessageData.has(threadId)) return 0;

        return this._readMessageData.get(threadId).lastReadMessageDate;
    }
}
