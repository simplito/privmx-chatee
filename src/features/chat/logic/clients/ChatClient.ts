'use client';

import {
    StoreClient,
    PlatformContext,
    UserWithPubKey,
    Platform
} from '@simplito/privmx-endpoint-web-sdk';
import { PAGE_SIZE, ThreadMessageCache } from './ThreadMessageCache';
import { createNewMetaFile, toChatInfo, updateMetadataFile } from './utils';
import { LastReadMessageFileContent } from '../hooks/useThreadCreate';
import { ChatMessage, ThreadBindingData, ThreadUsers, UserMetadata } from '@chat/data';
import { DecryptedChatMessage, DecryptedPrivateMessageData } from '@chat/data/types/types';

const defaultFileContent: LastReadMessageFileContent = { lastReadMessageDate: 0 };

export class ChatClient {
    private _thread;
    private _platformContext: PlatformContext = undefined;

    protected _threadCache: ThreadMessageCache;
    protected _storeClient: StoreClient;
    public chatInfo: ThreadBindingData;

    constructor(thread: { title: string; id: string; contextId: string }) {
        this._platformContext = Platform.context(thread.contextId);
        this._thread = this._platformContext.thread(thread.id);
        const parsedThreadData = toChatInfo(thread.title);

        this.chatInfo = {
            storeId: parsedThreadData.storeId,
            name: parsedThreadData.name,
            userMetadata: parsedThreadData.userMetadata
        };

        if (parsedThreadData.storeId !== '') {
            this._storeClient = new StoreClient(parsedThreadData.storeId);
        }

        this._threadCache = ThreadMessageCache.getInstance();
    }

    static async newChat(platformContext: PlatformContext, users: ThreadUsers[], title: string) {
        const allUsers: UserWithPubKey[] = users.map((user) => {
            return {
                userId: user.userId,
                pubKey: user.publicKey
            };
        });

        const managers: UserWithPubKey[] = users
            .filter((user) => user.isAdmin)
            .map((user) => {
                return {
                    userId: user.userId,
                    pubKey: user.publicKey
                };
            });

        const chatMeta = { users: allUsers, managers, title };
        const storeId = await platformContext.stores.new(chatMeta);
        const userMetadata: UserMetadata[] = [];
        for (let i = 0; i < allUsers.length; i++) {
            const fileId = await createNewMetaFile(allUsers[i].userId, defaultFileContent, storeId);

            userMetadata.push({
                username: allUsers[i].userId,
                fileId
            });
        }

        const threadMetadata = JSON.stringify({ name: title, storeId: storeId, userMetadata });
        const threadId = await platformContext.threads.new({
            users: allUsers,
            managers,
            name: threadMetadata
        });
        return new ChatClient({
            title: threadMetadata,
            id: threadId,
            contextId: platformContext.contextId()
        });
    }

    async loadMessages(id: string) {
        const currentPage = this._threadCache.getThreadMetaData(this.threadId)?.currentPage || 0;

        const allMessages: DecryptedChatMessage[] = [];
        let totalMessages: number = 0;

        for (let i = 0; i <= currentPage; i++) {
            const pageMessages = await this._thread.getMessages(i, {
                sort: 'desc',
                pageSize: PAGE_SIZE
            });
            if (pageMessages?.messages) {
                const encryptedMessages =
                    pageMessages.messages as unknown as DecryptedChatMessage[];
                allMessages.unshift(...encryptedMessages.toReversed());
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
        this._threadCache.loadNextMessagesPage(this.threadId);
        return await this.loadMessages(id);
    }

    public loadNewMessage(threadId: string, newMessage: DecryptedChatMessage) {
        this._threadCache.upsertMessage(threadId, newMessage);
        const newMessages = this._threadCache.getMessages(threadId);
        return newMessages;
    }

    public prefetchThreadContent(id: string) {
        this.loadMessages(id);
    }

    public get threadId(): string {
        return this._thread.id;
    }

    public hasMoreMessages(): boolean {
        if (!this._threadCache.hasThreadMetaData(this.threadId)) return false;
        return this._threadCache.getThreadMetaData(this.threadId).hasMoreMessages || false;
    }

    public getMessages(): ChatMessage[] | undefined {
        return this._threadCache.getMessages(this.threadId);
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
        const privateMetaToSend: DecryptedPrivateMessageData = {
            msgId: msg.msgId,
            type: msg.mimeType,
            author: {
                pubKey: 'pubKey',
                userId: msg.author
            },
            createDate: msg.createDate,
            text: msg.text,
            deleted: false
        };

        const threadMessageId = await this._thread.sendMessage({
            data: msg.text,
            privateMeta: privateMetaToSend,
            publicMeta: ''
        });

        return threadMessageId;
    }

    public async sendFileMessage(
        msg: Extract<ChatMessage, { status: 'pending' }>,
        file: File
    ): Promise<[threadMessageId: string, fileId: string]> {
        const readFile = (file: File): Promise<Uint8Array> => {
            return new Promise((resolve, reject) => {
                const fileReader = new FileReader();

                fileReader.onload = (event) => {
                    const arrayBuffer = event.target?.result;
                    if (arrayBuffer) {
                        resolve(new Uint8Array(arrayBuffer as ArrayBuffer));
                    } else {
                        reject(new Error('Failed to read file.'));
                    }
                };

                fileReader.onerror = () => {
                    reject(new Error('File could not be read.'));
                };

                fileReader.readAsArrayBuffer(file);
            });
        };

        try {
            const fileData = await readFile(file);
            const fileId = await this._storeClient.uploadFile({
                data: fileData,
                name: file.name,
                mimeType: file.type
            });

            if (msg.text.type === 'fileupload') msg.text.fileId = fileId;
            const threadMessageId = await this.sendTextMessage(msg);

            this._threadCache.updateMessage(msg.msgId, threadMessageId, msg.threadId);
            return [threadMessageId, fileId];
        } catch (error) {
            throw new Error('Unable to send file', { cause: 'file_send_error' });
        }
    }

    public async downloadFile(fileId: string) {
        return StoreClient.downloadFile(fileId);
    }

    public getThreadMessageTotal(threadId: string) {
        if (!this._threadCache.hasThreadMetaData(threadId)) return 0;
        return this._threadCache.getThreadMetaData(threadId).messagesTotal;
    }

    public get hasMessages() {
        return this._threadCache.hasMessages(this.threadId);
    }

    public async deleteMessage(messageId: string, threadId: string) {
        try {
            await this._platformContext.threads.deleteMessage(messageId);
            this._threadCache.deleteMessage(messageId, threadId);
        } catch (error) {
            throw new Error('Unable to delete message', { cause: 'message_Delete_error' });
        }
    }

    public deleteMessageInCache(messageId: string, threadId: string) {
        this._threadCache.deleteMessage(messageId, threadId);
    }

    public async markAsRead(username: string, readDate?: number) {
        try {
            const { fileId } = this.chatInfo.userMetadata.find(
                (data) => data.username === username
            );

            const lastRead = readDate || Date.now();
            const fileReadContent: LastReadMessageFileContent = {
                lastReadMessageDate: lastRead
            };
            this._threadCache.updateReadMessageData(this.threadId, {
                lastReadMessageDate: lastRead
            });
            await updateMetadataFile(fileId, username, fileReadContent);
        } catch (e) {
            console.error(e);
        }
    }

    get isRead() {
        return this._threadCache.isThreadRead(this.threadId);
    }

    get lastReadMessageDate() {
        return this._threadCache.getLastReadMessageDate(this.threadId);
    }
}
