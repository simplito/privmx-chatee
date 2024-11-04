import { Resource } from '@srs/App';
import { AppContext } from '@srs/AppContext';
import { AppEventBus, UserEvent } from '@srs/AppBus';
import { deserializeObject, Endpoint, PrivmxFile } from '@simplito/privmx-webendpoint-sdk';
import { FileResourceEvent } from '@chat/logic/messages-system/FileResourceEvent';

import { ChatAttachment, StoreFilePublicData } from '@chat/logic/messages-system/types';

export class ThreadFilesResource implements Resource {
    private _ctx: AppContext;
    private _bus: AppEventBus;
    getName = () => 'FilesResource';
    private static PAGE_SIZE = 100;

    private connection() {
        return Endpoint.connection();
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
        const context = Endpoint.connection();
        const pageEnterSubscriber = UserEvent.createSubscriber('page_enter', (page) => {
            if (page.chatId === '') return;

            const store = context.store(page.storeId);
            store.subscribeForFileEvents().then((channel) => {
                channel
                    .on('storeFileCreated', (payload) => {
                        this._bus.emit(
                            FileResourceEvent.newAttachment(
                                this.toMessageAttachment(page.chatId, payload.data)
                            )
                        );
                    })
                    .on('storeFileDeleted', (payload) => {
                        this._bus.emit(
                            FileResourceEvent.deletedAttachment({
                                storeId: payload.data.storeId,
                                attachmentId: payload.data.fileId,
                                chatId: page.chatId
                            })
                        );
                    });
            });

            this._currentSubscriptions.push({
                chatId: page.chatId,
                unsubscribe: () => {
                    return store.unsubscribeFromFileEvents();
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

    private toMessageAttachment(chatId: string, file: PrivmxFile): ChatAttachment {
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
        const storeFileList = await this.connection().store(chat.storeId).getFiles(page);
        const assets = storeFileList.readItems.map(
            this.toMessageAttachment.bind(this, chat.chatId)
        );

        return { assets, total: storeFileList.totalAvailable };
    }
}
