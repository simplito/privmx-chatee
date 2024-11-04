import { Service } from '@srs/App';
import { AppContext } from '@srs/AppContext';
import { AppEventBus, UserEvent } from '@srs/AppBus';
import { Endpoint, serializeObject, UserWithPubKey } from '@simplito/privmx-webendpoint-sdk';
import { Chat, ThreadPrivateData, ThreadResource, ThreadUsers } from '@chat/logic';

export class ThreadService implements Service {
    getName = () => 'ThreadService';
    private _ctx: AppContext;
    private _bus: AppEventBus;
    private platform: Endpoint;

    bind(ctx: AppContext, bus: AppEventBus) {
        this._ctx = ctx;
        this._bus = bus;
        const subscriber = UserEvent.createSubscriber('sign_in', () => {
            this.setupEvents();
        });
        this._bus.registerSubscriber(subscriber);
        return this;
    }

    setupEvents() {
        this.platform = Endpoint.connection();
    }

    contextId() {
        return this._ctx.user.contextId;
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

        const storeId = await this.platform.stores.new({
            contextId: this.contextId(),
            users: allUsers,
            managers: managers,
            privateMeta: serializeObject({
                title: title
            }),
            publicMeta: serializeObject({})
        });

        const threadMeta: ThreadPrivateData = {
            storeId,
            name: title
        };
        const threadId = await this.platform.threads.new({
            contextId: this.contextId(),
            users: allUsers,
            managers,
            privateMeta: serializeObject(threadMeta),
            publicMeta: serializeObject({})
        });

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
        const thread = this.platform.thread(threadId);
        const info = ThreadResource.threadToChat(await thread.info());
        await thread.delete();
        await this.platform.store(info.storeId).delete();
    }
}
