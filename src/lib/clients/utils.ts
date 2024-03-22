import { ChatMessage, ThreadBindingData } from '@chat';
import { ThreadMessage } from '../endpoint-api/types/threadMessage';

export function toChatInfo(threadData: string): ThreadBindingData {
    try {
        return JSON.parse(threadData);
    } catch (error) {
        return { name: threadData, storeId: '' };
    }
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
        threadId: msg.msgId,
        data: {
            author: { userId: msg.author, pubKey: 'pub' },
            deleted: false,
            date: msg.createDate,
            msgId: msg.msgId,
            text: msg.text,
            type: 'type',
            destination: {
                contextId: '',
                server: '',
                threadId: msg.threadId
            }
        }
    };
    return sentMessage;
}

export function toChatMessage(message: ThreadMessage): ChatMessage {
    try {
        const parsedData = JSON.parse(message.data.text);
        return {
            ...message,
            status: 'sent',
            data: { ...message.data, text: parsedData }
        };
    } catch (error) {
        const fallbackMessage: ChatMessage = {
            ...message,
            status: 'sent',
            data: {
                ...message.data,
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
