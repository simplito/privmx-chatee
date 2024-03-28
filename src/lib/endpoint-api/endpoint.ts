import { getEndpoint } from './getEndpoint';
import { ContextsList } from './types/context';
import { UserWithPubKey } from './types/user';
import { ThreadInfo } from './types/thread';
import { ThreadMessagesList } from './types/threadMessage';
import { Deferred } from '@/shared/utils/deferred';
import { Lock } from '@/shared/utils/lock';
import type {
    StoreFileData,
    StoreFileInfo,
    StoreFilesList,
    StoreInfo,
    StoreList
} from './types/store';
import type { EndpointApiInterface, SortOrder, Channel } from './types/endpointApiInterface';
import { EndpointEventManager } from './types/events';
import { EndpointTryCatch } from '@/shared/utils/decorators';

type ConnectionState =
    | { type: 'connected' }
    | { type: 'connecting'; deferred: Deferred<void> }
    | { type: 'disconnected' }
    | { type: 'disconnecting'; deferred: Deferred<void> };

type GenericEvent = {
    type: string;
    data: any;
};

export class Endpoint {
    public static instance: Deferred<Endpoint> | null = null;

    private connectionState: ConnectionState = { type: 'disconnected' };
    private endpointCallLock = new Lock();
    public eventLoopId: NodeJS.Timeout | null = null;

    static async getInstance(): Promise<Endpoint> {
        if (!this.instance) {
            this.instance = new Deferred<Endpoint>();
            const endpoint = await Endpoint.create();
            this.instance.resolve(endpoint);
        }
        return this.instance.promise;
    }

    private static async create(): Promise<Endpoint> {
        const endpointApiInterface = await getEndpoint();
        const endpoint = new Endpoint(endpointApiInterface);

        return endpoint;
    }

    // eslint-disable-next-line no-unused-vars
    public constructor(private endpoint: EndpointApiInterface) {}

    @EndpointTryCatch
    async contextList(skip: number, limit: number, sortOrder: SortOrder): Promise<ContextsList> {
        return await this.endpoint.contextList(skip, limit, sortOrder);
    }

    async cryptoSign(data: Buffer, key: string) {
        return await this.endpoint.cryptoSign(data, key);
    }

    async cryptoDecrypt(data: string, key: string): Promise<string> {
        return await this.endpoint.cryptoDecrypt(data, key);
    }

    async cryptoEncrypt(data: string, key: string): Promise<string> {
        return await this.endpoint.cryptoEncrypt(data, key);
    }

    async cryptoKeyConvertPEMToWIF(keyPEM: string): Promise<string> {
        return await this.endpoint.cryptoKeyConvertPEMToWIF(keyPEM);
    }

    async cryptoPrivKeyNew(baseString?: string) {
        if (baseString) {
            return await this.endpoint.cryptoPrivKeyNew(baseString);
        }
        return await this.endpoint.cryptoPrivKeyNew();
    }

    async cryptoPubKeyNew(privKey: string) {
        return await this.endpoint.cryptoPubKeyNew(privKey);
    }

    @EndpointTryCatch
    async platformConnect(privKey: string, solutionId: string, platformUrl: string) {
        if (this.connectionState.type === 'connected') {
            return;
        }
        if (this.connectionState.type === 'connecting') {
            await this.connectionState.deferred.promise;
            return;
        }

        const deferred = new Deferred<void>();
        this.connectionState = { type: 'connecting', deferred: deferred };

        await this.withEndpointCallLock(() =>
            this.endpoint.platformConnect(privKey, solutionId, platformUrl)
        );
        this.connectionState = { type: 'connected' };
        this.endpoint.subscribeToChannel('thread2');

        let eventLoop = () => {
            this.endpoint.waitEventAsJson().then((e) => {
                if (e.length > 0) {
                    try {
                        const obj: GenericEvent = JSON.parse(e);
                        if (obj.type == 'libPlatformDisconnected') {
                            EndpointEventManager.dispatchEvent({
                                type: obj.type,
                                data: obj.data
                            });

                            return;
                        }

                        EndpointEventManager.dispatchEvent({
                            type: obj.type,
                            data: obj.data
                        });
                    } catch (e) {
                        console.error(e);
                    }

                    this.eventLoopId = setTimeout(eventLoop, 0);
                }
            });
        };
        this.eventLoopId = setTimeout(eventLoop, 0);

        deferred.resolve();
    }

    async platformDisconnect(): Promise<void> {
        if (this.connectionState.type === 'disconnected') {
            return;
        }
        if (this.connectionState.type === 'disconnecting') {
            await this.connectionState.deferred.promise;
            return;
        }

        clearTimeout(this.eventLoopId);

        const deferred = new Deferred<void>();
        this.connectionState = { type: 'disconnecting', deferred: deferred };

        await this.endpoint.platformDisconnect();
        this.connectionState = { type: 'disconnected' };
        deferred.resolve();
    }

    @EndpointTryCatch
    async threadCreate(
        contextId: string,
        users: UserWithPubKey[],
        managers: UserWithPubKey[],
        title: string
    ): Promise<string> {
        return await this.endpoint.threadCreate(contextId, users, managers, title);
    }

    @EndpointTryCatch
    async threadDelete(threadId: string): Promise<void> {
        return await this.endpoint.threadDelete(threadId);
    }

    @EndpointTryCatch
    async threadGet(threadId: string): Promise<ThreadInfo> {
        return await this.endpoint.threadGet(threadId);
    }

    @EndpointTryCatch
    async threadList(contextId: string, skip: number, limit: number, sortOrder: SortOrder) {
        return await this.endpoint.threadList(contextId, skip, limit, sortOrder);
    }

    @EndpointTryCatch
    async threadMessageSend(
        threadId: string,
        clientThreadMessageId: string,
        clientThreadUserId: string,
        mimeType: string,
        text: string
    ): Promise<string> {
        return await this.endpoint.threadMessageSend(
            threadId,
            clientThreadMessageId,
            clientThreadUserId,
            mimeType,
            text
        );
    }

    @EndpointTryCatch
    async threadMessageGet(
        threadId: string,
        skip: number,
        limit: number,
        sortOrder: SortOrder
    ): Promise<ThreadMessagesList> {
        return await this.endpoint.threadMessagesGet(threadId, skip, limit, sortOrder);
    }

    @EndpointTryCatch
    async threadMessageDelete(messageId: string) {
        return await this.endpoint.threadMessageDelete(messageId);
    }

    @EndpointTryCatch
    async cryptoPrivKeyNewPbkdf2(salt: string, password: string) {
        return await this.endpoint.cryptoPrivKeyNewPbkdf2(salt, password);
    }

    private withEndpointCallLock<T>(fn: () => Promise<T>): Promise<T> {
        return this.endpointCallLock.withLock(fn);
    }

    @EndpointTryCatch
    async subscribeToChannel(channel: Channel) {
        return await this.endpoint.subscribeToChannel(channel);
    }

    @EndpointTryCatch
    async unsubscribeFromChannel(channel: Channel) {
        return await this.endpoint.unsubscribeFromChannel(channel);
    }

    // --------- stores ----------- //

    @EndpointTryCatch
    async storeCreate(
        contextId: string,
        users: UserWithPubKey[],
        managers: UserWithPubKey[],
        title: string
    ): Promise<string> {
        return await this.endpoint.storeCreate(contextId, users, managers, title);
    }

    @EndpointTryCatch
    async storeFileCreate(storeId: string, data?: StoreFileData): Promise<string> {
        return await this.endpoint.storeFileCreate(storeId, data);
    }
    @EndpointTryCatch
    async storeFileDelete(fileId: string): Promise<boolean> {
        return await this.endpoint.storeFileDelete(fileId);
    }

    @EndpointTryCatch
    async storeFileGet(fileId: string): Promise<StoreFileInfo> {
        return await this.endpoint.storeFileGet(fileId);
    }

    @EndpointTryCatch
    async storeFileList(
        storeId: string,
        skip: number,
        limit: number,
        sortOrder: SortOrder
    ): Promise<StoreFilesList> {
        return await this.endpoint.storeFileList(storeId, skip, limit, sortOrder);
    }

    @EndpointTryCatch
    async storeFileRead(fileId: string): Promise<StoreFileData> {
        return await this.endpoint.storeFileRead(fileId);
    }

    @EndpointTryCatch
    async storeFileWrite(fileId: string, data: StoreFileData): Promise<boolean> {
        return await this.endpoint.storeFileWrite(fileId, data);
    }

    @EndpointTryCatch
    async storeGet(fileId: string): Promise<StoreInfo> {
        return await this.endpoint.storeGet(fileId);
    }

    @EndpointTryCatch
    async storeList(
        contextId: string,
        skip: number,
        limit: number,
        sortOrder: SortOrder
    ): Promise<StoreList> {
        return await this.endpoint.storeList(contextId, skip, limit, sortOrder);
    }

    @EndpointTryCatch
    async storeDelete(storeId: string) {
        return await this.endpoint.storeDelete(storeId);
    }
}
