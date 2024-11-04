import { Resource } from '@srs/App';
import { AppContext } from '@srs/AppContext';
import { AppEventBus, UserEvent } from '@srs/AppBus';
import { deserializeObject, Message, Endpoint } from '@simplito/privmx-webendpoint-sdk';
import { MessageResourceEvent } from '@chat/logic/messages-system/MessageResourceEvent';

import {
    ChatFileMessage,
    ChatMessage,
    ChatTextMessage,
    ThreadMessageData,
    ThreadMessagePublicData
} from '@chat/logic/messages-system/types';

export class ThreadMessageResource implements Resource {
    private _ctx: AppContext;
    private _bus: AppEventBus;
    getName = () => 'MessageResource';
    private static PAGE_SIZE = 100;

    private thread(id: string) {
        return Endpoint.connection().thread(id);
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

    static toChatMessage(message: Message): ChatMessage {
        const messageData = deserializeObject(message.data) as ThreadMessageData;
        const publicData = deserializeObject(message.publicMeta) as ThreadMessagePublicData;
        if (publicData.mimetype === 'file' && 'fileId' in messageData) {
            return {
                author: message.info.author,
                status: 'sent',
                chatId: message.info.threadId,
                mimetype: 'file',
                sentDate: message.info.createDate,
                messageId: message.info.messageId,
                pendingId: publicData.pendingId,
                fileId: messageData.fileId,
                fileName: messageData.fileName
            } satisfies ChatFileMessage;
        } else if (publicData.mimetype === 'text' && 'text' in messageData) {
            return {
                author: message.info.author,
                status: 'sent',
                text: messageData.text,
                chatId: message.info.threadId,
                mimetype: 'text',
                sentDate: message.info.createDate,
                messageId: message.info.messageId,
                pendingId: publicData.pendingId
            } satisfies ChatTextMessage;
        } else {
            throw new Error('Invalid Message State');
        }
    }

    private _currentSubscriptions: { chatId: string; unsubscribe: () => Promise<void> }[] = [];

    async setupEvents() {
        const context = Endpoint.connection();
        const userSubscriber = UserEvent.createSubscriber('page_enter', (page) => {
            if (page.chatId === '') return;
            const thread = context.thread(page.chatId);
            thread.subscribeToMessageEvents().then((channel) => {
                channel
                    .on('threadNewMessage', (payload) => {
                        this._bus.emit(
                            MessageResourceEvent.newMessage(
                                ThreadMessageResource.toChatMessage(payload.data)
                            )
                        );
                    })
                    .on('threadMessageDeleted', (payload) => {
                        this._bus.emit(
                            MessageResourceEvent.deletedMessage({
                                messageId: payload.data.messageId,
                                chatId: payload.data.threadId
                            })
                        );
                    });
            });

            this._currentSubscriptions.push({
                chatId: page.chatId,
                unsubscribe: () => {
                    return thread.unsubscribeFromMessageEvents();
                }
            });
        });
        userSubscriber.add('page_leave', (page) => {
            this._currentSubscriptions.forEach((subscription) => {
                if (subscription.chatId === page.chatId) {
                    this._currentSubscriptions = this._currentSubscriptions.filter(
                        (x) => x.chatId !== page.chatId
                    );
                    subscription.unsubscribe().then(() => {});
                }
            });
        });

        this.eventCleanUpCallback = this._bus.registerSubscriber(userSubscriber);
    }

    async getMessages(threadId: string, page: number) {
        const threadMessageList = await this.thread(threadId).getMessages(page, {
            sort: 'desc',
            pageSize: ThreadMessageResource.PAGE_SIZE
        });

        const messages: ChatMessage[] = threadMessageList.readItems.map(
            ThreadMessageResource.toChatMessage
        );
        messages.reverse();
        return { messages, total: threadMessageList.totalAvailable };
    }
}
