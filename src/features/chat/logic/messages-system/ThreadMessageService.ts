import { Resource, Service } from '@srs/App';
import { AppContext } from '@srs/AppContext';
import { ThreadMessageData, ThreadMessagePublicData } from '@chat/logic/messages-system/types';
import { EndpointConnectionManager } from '@lib/endpoint-api/endpoint';
import { Utils } from '@simplito/privmx-webendpoint/extra';

export class ThreadMessageService implements Service {
    private _ctx: AppContext;

    getName = () => 'MessageService';

    bind(ctx: AppContext): Resource {
        this._ctx = ctx;
        return this;
    }

    async sendTextMessage(chatId: string, message: string, pendingId: string): Promise<void> {
        const threadApi = await EndpointConnectionManager.getThreadApi();

        await threadApi.sendMessage(
            chatId,
            Utils.serializeObject({
                mimetype: 'text',
                pendingId
            } satisfies ThreadMessagePublicData),
            new Uint8Array(),
            Utils.serializeObject({
                text: message
            } satisfies ThreadMessageData)
        );
    }

    async sendFileMessage(fileMessage: {
        chatId: string;
        storeId: string;
        attachmentId: string;
        attachmentName: string;
        pendingId: string;
    }): Promise<void> {
        const threadApi = await EndpointConnectionManager.getThreadApi();
        threadApi.sendMessage(
            fileMessage.chatId,
            Utils.serializeObject({
                mimetype: 'file',
                pendingId: fileMessage.pendingId
            } satisfies ThreadMessagePublicData),
            new Uint8Array(),
            Utils.serializeObject({
                fileId: fileMessage.attachmentId,
                fileName: fileMessage.attachmentName
            } satisfies ThreadMessageData)
        );
    }

    async deleteMessage(messageId: string) {
        const threadApi = await EndpointConnectionManager.getThreadApi();
        threadApi.deleteMessage(messageId);
    }
}
