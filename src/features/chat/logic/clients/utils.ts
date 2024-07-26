import { ChatMessage, ThreadBindingData } from '@chat/data';
import { LastReadMessageFileContent } from '../hooks/useThreadCreate';
import { StoreClient } from '@simplito/privmx-endpoint-web-sdk';
import { DecryptedChatMessage } from '@chat/data/types/types';

export type EncryptedMessageList = {
    messages: DecryptedChatMessage[];
    messagesTotal: number;
};

export type Asset = {
    name: string;
    data: Uint8Array;
    mimetype: string;
};

export function toChatInfo(threadData: string): ThreadBindingData {
    try {
        return JSON.parse(threadData);
    } catch (error) {
        return { name: threadData, storeId: '', userMetadata: [] };
    }
}

export function readLastReadFile(file: Asset): LastReadMessageFileContent {
    return JSON.parse(Buffer.from(file.data).toString());
}

export function toSendMessage(
    threadMessageId: string,
    msg: Extract<ChatMessage, { status: 'pending' }>
): Extract<ChatMessage, { status: 'sent' }> {
    const sentMessage: Extract<ChatMessage, { status: 'sent' }> = {
        author: msg.author,
        createDate: msg.createDate,
        messageId: threadMessageId,
        status: 'sent',
        threadId: msg.threadId,
        data: {
            author: { userId: msg.author, pubKey: 'pub' },
            deleted: false,
            date: msg.createDate,
            msgId: msg.msgId,
            text: msg.text,
            type: 'type',
            destination: {
                threadId: msg.threadId,
                author: msg.author,
                createDate: Date.now(),
                messageId: threadMessageId
            }
        }
    };
    return sentMessage;
}

export function toChatMessage(message: DecryptedChatMessage): ChatMessage {
    try {
        return {
            author: message.info.author,
            createDate: message.privateMeta.createDate,
            messageId: message.info.messageId,
            threadId: message.info.threadId,
            status: 'sent',
            data: {
                author: { userId: message.info.author, pubKey: 'pubkey' },
                date: message.privateMeta.createDate,
                deleted: false,
                destination: message.info,
                msgId: message.privateMeta.msgId,
                text: message.data,
                type: 'text'
            }
        };
    } catch (error) {
        const fallbackMessage: ChatMessage = {
            author: message.info.author,
            createDate: message.privateMeta.createDate,
            messageId: message.info.messageId,
            threadId: message.info.threadId,
            status: 'sent',
            data: {
                author: { userId: message.info.author, pubKey: 'pubkey' },
                date: message.privateMeta.createDate,
                deleted: false,
                destination: message.info,
                msgId: message.privateMeta.msgId,
                type: 'text',
                text: { type: 'text', content: 'Invalid content' }
            }
        };
        return fallbackMessage;
    }
}

export function settleMessage(messages: ChatMessage[], msgId: string, threadMessageId: string) {
    return messages.map((threadMessage) => {
        if (threadMessage.status === 'pending' && threadMessage.msgId === msgId) {
            return { ...toSendMessage(threadMessageId, threadMessage) };
        } else {
            return threadMessage;
        }
    });
}

export async function createNewMetaFile<T extends Record<string, any>>(
    name: string,
    data: T,
    storeId: string
) {
    const storeClient = new StoreClient(storeId);
    const fileName = `.${name}`;
    const parsedData = new TextEncoder().encode(JSON.stringify(data));

    return await storeClient.uploadFile({
        name: fileName,
        data: parsedData,
        mimeType: 'text/plain'
    });
}

export async function updateMetadataFile<T extends Record<string, any>>(
    fileId: string,
    name: string,
    data: T
) {
    const parsedData = new TextEncoder().encode(JSON.stringify(data));
    return await StoreClient.overrideFile({
        fileId,
        data: parsedData,
        mimeType: 'text/plain',
        name
    });
}
