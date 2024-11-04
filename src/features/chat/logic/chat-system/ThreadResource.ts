import { Resource } from '@srs/App';
import { AppContext } from '@srs/AppContext';
import { AppEventBus, UserEvent } from '@srs/AppBus';
import { deserializeObject, Endpoint, Thread } from '@simplito/privmx-webendpoint-sdk';
import { ThreadResourceEvent } from '@srs/ThreadResourceEvent';
import { Chat, ThreadPrivateData } from '@chat/logic';

export class ThreadResource implements Resource {
    private _ctx: AppContext;
    private _bus: AppEventBus;

    private threads() {
        return Endpoint.connection().threads;
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
        const channel = await this.threads().subscribeToThreadEvents();
        console.log("Setting up thread res events ")
        channel
            .on('threadCreated', (payload) => {
                const parsedThread = ThreadResource.threadToChat(payload.data);
                this._bus.emit(ThreadResourceEvent.newThread(parsedThread));
            })
            .on('threadUpdated', (payload) => {
                const parsedThread = ThreadResource.threadToChat(payload.data);
                this._bus.emit(ThreadResourceEvent.updatedThread(parsedThread));
            })
            .on('threadStatsChanged', (payload) => {
                this._bus.emit(ThreadResourceEvent.statsThread({threadId:payload.data.threadId,lastMsgDate:payload.data.lastMsgDate,messages:payload.data.messagesCount}));
            })
            .on('threadDeleted', (payload) => {
                this._bus.emit(ThreadResourceEvent.deletedThread(payload.data));
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
        const threadList = await this.threads().list({
            contextId: this._ctx.user.contextId,
            pageIndex: 0
        });
        const deserializedThreads: Chat[] = threadList.readItems.map((thread) => {
            return ThreadResource.threadToChat(thread);
        });
        return { threads: deserializedThreads, total: threadList.totalAvailable };
    }

    async getThreadStoreId(threadId: string) {
        const context = Endpoint.connection();
        const threadInfo = ThreadResource.threadToChat(await context.thread(threadId).info());
        return threadInfo.storeId;
    }
}
