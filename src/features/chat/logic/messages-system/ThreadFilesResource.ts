import { Resource } from '@srs/App';
import { AppContext } from '@srs/AppContext';
import { AppEventBus, UserEvent } from '@srs/AppBus';
import { FileResourceEvent } from '@chat/logic/messages-system/FileResourceEvent';

import { ChatAttachment, StoreFilePublicData } from '@chat/logic/messages-system/types';
import { EndpointConnectionManager } from '@lib/endpoint-api/endpoint';
import { deserializeObject } from '@simplito/privmx-webendpoint/extra/utils';
import { Types } from '@simplito/privmx-webendpoint';

export class ThreadFilesResource implements Resource {
    private _ctx: AppContext;
    private _bus: AppEventBus;
    getName = () => 'FilesResource';
    private static PAGE_SIZE = 100;

    private async getApi() {
        return await EndpointConnectionManager.getStoreApi();
    }

    private async getStoreEventManager() {
        return await EndpointConnectionManager.getStoreEventManager();
    }

    private eventCleanUpCallback: VoidFunction | null = null;

    bind(ctx: AppContext, bus: AppEventBus): Resource {
        this._bus = bus;
        const subscriber = UserEvent.createSubscriber('sign_in', () => {
            this.setupEvents();
        });
        subscriber.add('sign_out', () => {
            this.eventCleanUpCallback?.();
        });
        this._bus.registerSubscriber(subscriber);
        this._ctx = ctx;
        return this;
    }

    private _currentSubscriptions: { chatId: string; unsubscribe: () => Promise<void> }[] = [];

    async setupEvents() {
        const eventManager = await this.getStoreEventManager();

        // const context = Endpoint.connection();
        const pageEnterSubscriber = UserEvent.createSubscriber('page_enter', async (page) => {
            if (page.chatId === '') return;

            await eventManager.onFileEvent(page.storeId, {
                event: 'storeFileCreated',
                callback: (payload) => {
                    this._bus.emit(
                        FileResourceEvent.newAttachment(
                            this.toMessageAttachment(page.chatId, payload.data)
                        )
                    );
                }
            });

            await eventManager.onFileEvent(page.storeId, {
                event: 'storeFileDeleted',
                callback: (payload) => {
                    this._bus.emit(
                        FileResourceEvent.deletedAttachment({
                            storeId: payload.data.storeId,
                            attachmentId: payload.data.fileId,
                            chatId: page.chatId
                        })
                    );
                }
            });

            this._currentSubscriptions.push({
                chatId: page.chatId,
                unsubscribe: async () => {
                    return await eventManager.unsubscribeFromModuleElementsEvents(page.storeId);
                }
            });
        });
        pageEnterSubscriber.add('page_leave', (page) => {
            this._currentSubscriptions.forEach((subscription) => {
                if (subscription.chatId === page.chatId) {
                    this._currentSubscriptions = this._currentSubscriptions.filter(
                        (x) => x.chatId !== page.chatId
                    );
                    subscription.unsubscribe().then(() => {});
                }
            });
        });
        this.eventCleanUpCallback = this._bus.registerSubscriber(pageEnterSubscriber);
    }

    private toMessageAttachment(chatId: string, file: Types.File): ChatAttachment {
        const publicData = deserializeObject(file.publicMeta) as StoreFilePublicData;
        return {
            attachmentId: file.info.fileId,
            author: file.info.author,
            mimetype: publicData.mimetype,
            size: file.size,
            name: publicData.name,
            sendDate: file.info.createDate,
            chatId: chatId,
            storeId: file.info.storeId
        } satisfies ChatAttachment;
    }

    async getChatFiles(chat: { storeId: string; chatId: string }, page: number) {
        const storeApi = await this.getApi();
        const storeFileList = await storeApi.listFiles(chat.storeId, {
            limit: 100,
            skip: page * 100,
            sortOrder: 'desc'
        });
        const assets = storeFileList.readItems.map(
            this.toMessageAttachment.bind(this, chat.chatId)
        );

        return { assets, total: storeFileList.totalAvailable };
    }
}
