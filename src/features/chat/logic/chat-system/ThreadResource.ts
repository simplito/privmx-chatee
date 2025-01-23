import { Resource } from '@srs/App';
import { AppContext } from '@srs/AppContext';
import { AppEventBus, UserEvent } from '@srs/AppBus';
import { ThreadResourceEvent } from '@srs/ThreadResourceEvent';
import { Chat, ThreadPrivateData } from '@chat/logic';
import { EndpointConnectionManager } from '@lib/endpoint-api/endpoint';
import { deserializeObject } from '@simplito/privmx-webendpoint/extra/utils';
import { Thread } from '@simplito/privmx-webendpoint/Types';

export class ThreadResource implements Resource {
    private _ctx: AppContext;
    private _bus: AppEventBus;

    private async threads() {
        return await EndpointConnectionManager.getThreadApi();
    }

    private async getThreadEventManager() {
        return await EndpointConnectionManager.getThreadEventManager();
    }

    getName(): string {
        return 'ThreadResource';
    }

    bind(ctx: AppContext, bus: AppEventBus) {
        this._ctx = ctx;
        this._bus = bus;
        const subscriber = UserEvent.createSubscriber('sign_in', () => {
            this.setupEvents();
        });
        this._bus.registerSubscriber(subscriber);
        return this;
    }

    async setupEvents() {
        const eventManager = await this.getThreadEventManager();

        await eventManager.onThreadEvent({
            event: 'threadCreated',
            callback: (payload) => {
                const parsedThread = ThreadResource.threadToChat(payload.data);
                this._bus.emit(ThreadResourceEvent.newThread(parsedThread));
            }
        });

        await eventManager.onThreadEvent({
            event: 'threadUpdated',
            callback: (payload) => {
                const parsedThread = ThreadResource.threadToChat(payload.data);
                this._bus.emit(ThreadResourceEvent.updatedThread(parsedThread));
            }
        });

        await eventManager.onThreadEvent({
            event: 'threadStatsChanged',
            callback: (payload) => {
                this._bus.emit(
                    ThreadResourceEvent.statsThread({
                        //@ts-ignore
                        threadId: payload.data.threadId,
                        lastMsgDate: payload.data.lastMsgDate,
                        messages: payload.data.messagesCount
                    })
                );
            }
        });

        await eventManager.onThreadEvent({
            event: 'threadDeleted',
            callback: (payload) => {
                this._bus.emit(ThreadResourceEvent.deletedThread(payload.data));
            }
        });
    }

    static threadToChat(thread: Thread): Chat {
        const chatInfo = deserializeObject(thread.privateMeta) as ThreadPrivateData;
        return {
            chatId: thread.threadId,
            title: chatInfo.name,
            storeId: chatInfo.storeId,
            creationDate: thread.createDate,
            managers: thread.managers,
            users: thread.users,
            lastMessageDate: thread.lastMsgDate,
            creator: thread.lastModifier,
            contextId: thread.contextId
        };
    }

    async getThreadList(page: number): Promise<{ threads: Chat[]; total: number }> {
        const api = await this.threads();

        const threadList = await api.listThreads(this._ctx.user.contextId, {
            limit: 100,
            skip: 100 * page,
            sortOrder: 'desc'
        });

        const deserializedThreads: Chat[] = threadList.readItems.map((thread) => {
            return ThreadResource.threadToChat(thread);
        });
        return { threads: deserializedThreads, total: threadList.totalAvailable };
    }

    async getThreadStoreId(threadId: string) {
        const threadApi = await this.threads();
        const threadInfo = ThreadResource.threadToChat(await threadApi.getThread(threadId));
        return threadInfo.storeId;
    }
}
