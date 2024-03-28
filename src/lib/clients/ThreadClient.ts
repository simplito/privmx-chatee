'use client';
import { Endpoint } from '@/lib/endpoint-api/endpoint';
import { ChatMessage } from '../../shared/pages/chat';
import { ThreadMessage } from '@/lib/endpoint-api/types/threadMessage';
import { StoreClient } from '@/lib/clients/StoreClient';
import { ThreadBindingData } from '../../shared/pages/chat/types';
import { PAGE_SIZE, ThreadMessageCache } from './ThreadMessageCache';
import { toChatInfo } from './utils';

export class ThreadClient {
    private _threadId: string = '';

    protected _threadCache: ThreadMessageCache;
    protected _storeClient: StoreClient;
    public chatInfo: ThreadBindingData;

    constructor(thread: { title: string; id: string }) {
        this._threadId = thread.id;

        const parsedThreadData = toChatInfo(thread.title);

        this.chatInfo = {
            storeId: parsedThreadData.storeId,
            name: parsedThreadData.name
        };

        if (parsedThreadData.storeId !== '') {
            this._storeClient = new StoreClient(parsedThreadData.storeId);
        }

        this._threadCache = ThreadMessageCache.getInstance();
    }

    async loadMessages(id: string) {
        const endpoint = await Endpoint.getInstance();
        const currentPage = this._threadCache.getThreadMetaData(this._threadId)?.currentPage || 0;

        const allMessages: ThreadMessage[] = [];
        let totalMessages: number = 0;

        for (let i = 0; i <= currentPage; i++) {
            const pageMessages = await endpoint.threadMessageGet(
                id,
                i * PAGE_SIZE,
                PAGE_SIZE,
                'desc'
            );
            if (pageMessages?.messages) {
                allMessages.unshift(...pageMessages.messages.toReversed());
                totalMessages = pageMessages.messagesTotal;
            }
        }

        const newMessages = this._threadCache.setMessages(id, {
            messages: allMessages,
            messagesTotal: totalMessages
        });

        return newMessages;
    }

    public async loadNextMessagesPage(id: string | undefined) {
        this._threadCache.loadNextMessagesPage(this._threadId);
        return await this.loadMessages(id);
    }

    public loadNewMessage(threadId: string, newMessage: ThreadMessage) {
        this._threadCache.upsertMessage(threadId, newMessage);
        const newMessages = this._threadCache.getMessages(threadId);
        return newMessages;
    }

    public prefetchThreadContent(id: string) {
        this.loadMessages(id);
    }

    public get threadId(): string {
        return this._threadId;
    }

    public hasMoreMessages(): boolean {
        if (!this._threadCache.hasThreadMetaData(this._threadId)) return false;
        return this._threadCache.getThreadMetaData(this._threadId).hasMoreMessages || false;
    }

    public getMessages(): ChatMessage[] | undefined {
        return this._threadCache.getMessages(this._threadId);
    }

    public createNewMessage(
        threadId: string,
        message: { author: string; text: string }
    ): Extract<ChatMessage, { status: 'pending' }> {
        const nextMsgId = crypto.randomUUID();

        const newMsg: Extract<ChatMessage, { status: 'pending' }> = {
            status: 'pending',
            author: message.author,
            text: { type: 'text', content: message.text },
            msgId: nextMsgId || '0',
            mimeType: 'text/plain',
            threadId: threadId,
            createDate: Date.now()
        };

        return newMsg;
    }

    public createFileMessage(
        threadId: string,
        message: {
            author: string;
            fileId: string;
            fileName: string;
            fileMimeType: string;
        }
    ): Extract<ChatMessage, { status: 'pending' }> {
        try {
            const nextMsgId = crypto.randomUUID();

            const newMsg: Extract<ChatMessage, { status: 'pending' }> = {
                status: 'pending',
                author: message.author,
                text: {
                    type: 'fileupload',
                    storeId: this.chatInfo.storeId,
                    fileId: message.fileId,
                    fileName: message.fileName,
                    fileMimeType: message.fileMimeType
                },
                msgId: nextMsgId || '0',
                mimeType: message.fileMimeType,
                threadId: threadId,
                createDate: Date.now()
            };

            return newMsg;
        } catch (e) {
            return null;
        }
    }

    public async sendTextMessage(msg: Extract<ChatMessage, { status: 'pending' }>) {
        const endpoint = await Endpoint.getInstance();

        const threadMessageId = await endpoint.threadMessageSend(
            msg.threadId,
            msg.msgId,
            msg.author,
            msg.mimeType,
            JSON.stringify(msg.text)
        );

        this._threadCache.updateMessage(msg.msgId, threadMessageId, msg.threadId);

        return threadMessageId;
    }

    public async sendFileMessage(
        msg: Extract<ChatMessage, { status: 'pending' }>,
        file: File
    ): Promise<[threadMessageId: string, fileId: string]> {
        const endpoint = await Endpoint.getInstance();

        try {
            const fileId = await this._storeClient.sendNewFile(file);

            if (msg.text.type === 'fileupload') msg.text.fileId = fileId;

            const [threadMessageId] = await Promise.all([
                endpoint.threadMessageSend(
                    msg.threadId,
                    msg.msgId,
                    msg.author,
                    msg.mimeType,
                    JSON.stringify(msg.text)
                )
            ]);

            this._threadCache.updateMessage(msg.msgId, threadMessageId, msg.threadId);
            return [threadMessageId, fileId];
        } catch (error) {
            throw new Error('Unable to send file', { cause: 'file_send_error' });
        }
    }

    public async downloadFile(fileId: string, name: string) {
        return this._storeClient.downloadFile(fileId, name);
    }

    public getThreadMessageTotal(threadId: string) {
        if (!this._threadCache.hasThreadMetaData(threadId)) return 0;
        return this._threadCache.getThreadMetaData(threadId).messagesTotal;
    }

    public get hasMessages() {
        return this._threadCache.hasMessages(this.threadId);
    }

    public async deleteMessage(messageId: string, threadId: string) {
        const endPoint = await Endpoint.getInstance();

        try {
            await endPoint.threadMessageDelete(messageId);
            this._threadCache.deleteMessage(messageId, threadId);
        } catch (error) {
            throw new Error('Unable to delete message', { cause: 'message_Delete_error' });
        }
    }

    public deleteMessageInCache(messageId: string, threadId: string) {
        this._threadCache.deleteMessage(messageId, threadId);
    }
}
