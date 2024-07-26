import { ServerInfo, ThreadInfo, UserWithPubKey } from '@simplito/privmx-endpoint-web-sdk';

export type ChatMessage =
    | {
          status: 'sent';
          messageId: string;
          threadId: string;
          createDate: number;
          author: string; // userId
          data: {
              msgId: string;
              type: string;
              text: MessageContent;
              date: number;
              deleted: boolean;
              author: UserWithPubKey;
              destination: ServerInfo;
          };
      }
    | {
          status: 'pending';
          author: string;
          threadId: string;
          msgId: string;
          mimeType: string;
          text: MessageContent;
          createDate: number;
      };

export type JSONMessageContent = string & { json?: never };

export type MessageContent =
    | {
          type: 'text';
          content: string;
      }
    | {
          type: 'fileupload';
          storeId: string;
          fileId: string;
          fileName: string;
          fileMimeType: string;
      };

export interface ChatInfo extends Omit<ThreadInfo, 'data'> {
    title: string;
    storeId: string;
}

export interface UserMetadata {
    username: string;
    fileId: string;
}
export interface ThreadBindingData {
    name: string;
    storeId: string;
    userMetadata: UserMetadata[];
}

export interface ThreadUsers {
    userId: string;
    publicKey: string;
    isAdmin: boolean;
}

export interface DecryptedPrivateMessageData {
    msgId: string;
    type: string;
    text: MessageContent;
    createDate: number;
    deleted: boolean;
    author: UserWithPubKey;
}

export interface DecryptedChatMessage {
    info: ServerInfo;
    privateMeta: DecryptedPrivateMessageData;
    publicMeta: '';
    data: MessageContent;
}
