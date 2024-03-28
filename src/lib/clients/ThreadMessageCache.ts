'use client';
import { ChatMessage } from '../../shared/pages/chat';
import { ThreadMessage, ThreadMessagesList } from '@/lib/endpoint-api/types/threadMessage';
import { settleMessage, toChatMessage } from './utils';

export const PAGE_SIZE = 50;

export class ThreadMessageCache {
    private _messages: Map<string, ChatMessage[]> = new Map();
    private _messagesMetadata: Map<
        string,
        { messagesTotal: number; currentPage: number; pageCount: number; hasMoreMessages: boolean }
    > = new Map();

    private static instance: ThreadMessageCache = null;

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
}
