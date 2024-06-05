import { ThreadInfo, UserWithPubKey, ServerInfo } from '@privmx/endpoint-web';

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

export interface ThreadBindingData {
    name: string;
    storeId: string;
}
