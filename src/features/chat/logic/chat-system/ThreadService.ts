import { Service } from '@srs/App';
import { AppContext } from '@srs/AppContext';
import { AppEventBus } from '@srs/AppBus';
import { Chat, ThreadPrivateData, ThreadResource, ThreadUsers } from '@chat/logic';
import { EndpointConnectionManager } from '@lib/endpoint-api/endpoint';
import { UserWithPubKey } from '@simplito/privmx-webendpoint/Types';
import { serializeObject } from '@simplito/privmx-webendpoint/extra/utils';

export class ThreadService implements Service {
    getName = () => 'ThreadService';
    private _ctx: AppContext;
    private _bus: AppEventBus;

    bind(ctx: AppContext, bus: AppEventBus) {
        this._ctx = ctx;
        this._bus = bus;
        return this;
    }

    contextId() {
        return this._ctx.user.contextId;
    }

    async storeApi() {
        return await EndpointConnectionManager.getStoreApi();
    }

    async threadApi() {
        return await EndpointConnectionManager.getThreadApi();
    }

    async createThread({ users, title }: { title: string; users: ThreadUsers[] }) {
        const allUsers: UserWithPubKey[] = users.map((user) => {
            return {
                userId: user.userId,
                pubKey: user.publicKey
            };
        });

        const managers: UserWithPubKey[] = users
            .filter((user) => user.isAdmin)
            .map((user) => {
                return {
                    userId: user.userId,
                    pubKey: user.publicKey
                };
            });
        const storeApi = await this.storeApi();

        const storeId = await storeApi.createStore(
            this.contextId(),
            allUsers,
            managers,
            serializeObject({}),
            serializeObject({ title })
        );

        const threadApi = await this.threadApi();

        const threadMeta: ThreadPrivateData = {
            storeId,
            name: title
        };

        const threadId = await threadApi.createThread(
            this.contextId(),
            allUsers,
            managers,
            serializeObject({}),
            serializeObject(threadMeta)
        );

        return {
            storeId,
            title,
            chatId: threadId,
            contextId: this.contextId(),
            users: allUsers.map((usr) => usr.userId),
            managers: managers.map((usr) => usr.userId),
            lastMessageDate: 0,
            creationDate: Date.now(),
            creator: this._ctx.user.username
        } satisfies Chat;
    }

    async deleteThread(threadId: string) {
        const threadApi = await this.threadApi();
        const thread = await threadApi.getThread(threadId);
        const info = ThreadResource.threadToChat(thread);
        await threadApi.deleteThread(threadId);

        const storeApi = await this.storeApi();
        await storeApi.deleteStore(info.storeId);
    }
}
