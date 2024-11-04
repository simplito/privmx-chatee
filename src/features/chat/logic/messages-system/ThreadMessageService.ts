import { Resource, Service } from '@srs/App';
import { AppContext } from '@srs/AppContext';
import { Endpoint, serializeObject } from '@simplito/privmx-webendpoint-sdk';
import { ThreadMessageData, ThreadMessagePublicData } from '@chat/logic/messages-system/types';

export class ThreadMessageService implements Service {
    private _ctx: AppContext;

    private connection() {
        return Endpoint.connection();
    }

    getName = () => 'MessageService';

    bind(ctx: AppContext): Resource {
        this._ctx = ctx;
        return this;
    }

    async sendTextMessage(chatId: string, message: string, pendingId: string): Promise<void> {
        const thread = this.connection().thread(chatId);
        await thread.sendMessage({
            data: serializeObject({
                text: message
            } satisfies ThreadMessageData),
            publicMeta: serializeObject({
                mimetype: 'text',
                pendingId
            } satisfies ThreadMessagePublicData),
            privateMeta: new Uint8Array()
        });
    }

    async sendFileMessage(fileMessage: {
        chatId: string;
        storeId: string;
        attachmentId: string;
        attachmentName: string;
        pendingId: string;
    }): Promise<void> {
        const thread = this.connection().thread(fileMessage.chatId);
        await thread.sendMessage({
            data: serializeObject({
                fileId: fileMessage.attachmentId,
                fileName: fileMessage.attachmentName
            } satisfies ThreadMessageData),
            publicMeta: serializeObject({
                mimetype: 'file',
                pendingId: fileMessage.pendingId
            } satisfies ThreadMessagePublicData),
            privateMeta: new Uint8Array()
        });
    }

    async deleteMessage(messageId: string) {
        const threads = Endpoint.connection().threads;
        await threads.deleteMessage(messageId);
    }
}
