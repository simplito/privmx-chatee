import { ThreadInfo } from '@/lib/endpoint-api/types/thread';
import { ThreadMessageDataDestination } from '@/lib/endpoint-api/types/threadMessage';
import { UserWithPubKey } from '@/lib/endpoint-api/types/user';

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
              destination: ThreadMessageDataDestination;
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
