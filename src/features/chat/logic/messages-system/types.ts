export interface BaseChatMessage {
    author: string;
    chatId: string;
    sentDate: number;
    messageId: string;
    pendingId: string;
    status: 'pending' | 'sent';
}

export interface ChatTextMessage extends BaseChatMessage {
    text: string;
    mimetype: 'text';
}

export interface ChatFileMessage extends BaseChatMessage {
    fileId: string;
    fileName: string;
    mimetype: 'file';
}

export type ChatMessage = ChatTextMessage | ChatFileMessage;

export interface ThreadMessagePublicData {
    mimetype: string; // text / file
    pendingId: string;
}

export type ThreadMessageData =
    | {
          fileId: string;
          fileName: string;
      }
    | {
          text: string;
      };

export interface ChatAttachment {
    attachmentId: string;
    name: string;
    mimetype: string;
    author: string;
    size: number;
    sendDate: number;
    chatId: string;
    storeId: string;
}

export interface StoreFilePublicData {
    mimetype: string;
    name: string;
    chatId: string;
}
