/* eslint-disable no-unused-vars */

import type { ContextsList } from './context';
import { StoreFileData, StoreFileInfo, StoreFilesList, StoreInfo, StoreList } from './store';
import { ThreadInfo, ThreadsList } from './thread';
import { ThreadMessagesList } from './threadMessage';
import type { UserWithPubKey } from './user';

export type SortOrder = 'desc' | 'asc';
export type Channel =
    | 'inbox'
    | 'store'
    | `store/${string}/files`
    | 'thread2'
    | `thread2/${string}/messages`;

export declare class EndpointApiInterface {
    contextList(skip: number, limit: number, sortOrder: SortOrder): Promise<ContextsList>;

    cryptoDecrypt: (data: string, key: string) => Promise<string>;
    cryptoEncrypt: (data: string, key: string) => Promise<string>;
    cryptoKeyConvertPEMToWIF: (keyPEM: string) => Promise<string>;
    cryptoPrivKeyNew: (baseString?: string) => Promise<string>;
    cryptoPubKeyNew: (privKey: string) => Promise<string>;
    cryptoSign: (data: Buffer, privKey: string) => Promise<string>;
    cryptoPrivKeyNewPbkdf2: (salt: string, password: string) => Promise<string>;

    platformConnect: (privKey: string, solutionId: string, platformUrl: string) => Promise<void>;
    platformDisconnect: () => Promise<void>;

    threadCreate: (
        contextId: string,
        users: UserWithPubKey[],
        managers: UserWithPubKey[],
        title: string
    ) => Promise<string>;
    threadDelete: (threadId: string) => Promise<void>;

    threadGet: (threadId: string) => Promise<ThreadInfo>;
    threadList: (
        contextId: string,
        skip: number,
        limit: number,
        sortOrder: SortOrder
    ) => Promise<ThreadsList>;
    threadMessageSend: (
        threadId: string,
        clientThreadMessageId: string,
        clientThreadUserId: string,
        mimeType: string,
        text: string
    ) => Promise<string>;

    threadMessagesGet: (
        threadId: string,
        skip: number,
        limit: number,
        sortOrder: SortOrder
    ) => Promise<ThreadMessagesList>;

    threadMessageDelete: (messageId: string) => Promise<void>;

    subscribeToChannel: (channel: Channel) => Promise<void>;
    unsubscribeFromChannel: (channel: Channel) => Promise<void>;

    waitEventAsJson: () => Promise<string>;

    storeCreate: (
        contextId: string,
        users: UserWithPubKey[],
        managers: UserWithPubKey[],
        title: string
    ) => Promise<string>;

    storeDelete: (storeId: string) => Promise<void>;
    storeFileCreate: (storeId: string, data?: StoreFileData) => Promise<string>;
    storeFileDelete: (fileId: string) => Promise<boolean>;
    storeFileGet: (fileId: string) => Promise<StoreFileInfo>;
    storeFileList: (
        storeId: string,
        skip: number,
        limit: number,
        sortOrder: SortOrder
    ) => Promise<StoreFilesList>;
    storeFileRead: (fileId: string) => Promise<StoreFileData>;
    storeFileWrite: (fileId: string, data: StoreFileData) => Promise<boolean>;
    storeGet: (storeId: string) => Promise<StoreInfo>;
    storeList: (
        contextId: string,
        skip: number,
        limit: number,
        sortOrder: SortOrder
    ) => Promise<StoreList>;
}
