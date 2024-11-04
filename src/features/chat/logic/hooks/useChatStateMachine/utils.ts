import { ChatMessage } from '@chat/logic/messages-system/types';

export type Asset = {
    name: string;
    data: Uint8Array;
    mimetype: string;
};

export function toSendMessage(threadMessageId: string, msg: ChatMessage): ChatMessage {
    const sentMessage = {
        ...msg,
        status: 'sent',
        messageId: threadMessageId
    } satisfies ChatMessage;
    return sentMessage;
}
