import { JSONMessageContent } from '@/shared/pages/chat/types';

export interface ThreadMessage {
    threadId: string;
    messageId: string;
    createDate: number;
    author: string; // userId
    data: ThreadMessageData;
}

export interface ThreadMessageData {
    msgId: string;
    type: string;
    text: JSONMessageContent;
    date: number;
    deleted: boolean;
    author: ThreadMessageDataAuthor;
    destination: ThreadMessageDataDestination;
}

export interface ThreadMessagesList {
    messagesTotal: number;
    messages: ThreadMessage[];
}

export interface ThreadMessageDataDestination {
    server: string;
    contextId: string;
    threadId: string;
}

export interface ThreadMessageDataAuthor {
    userId: string;
    pubKey: string;
}
