import { Resource, Service } from '@srs/App';
import { AppContext } from '@srs/AppContext';
import { Endpoint, serializeObject } from '@simplito/privmx-webendpoint-sdk';
import { StoreFilePublicData } from '@chat/logic/messages-system/types';

export class ThreadFileService implements Service {
    private _ctx: AppContext;

    private connection() {
        return Endpoint.connection();
    }

    getName = () => 'FilesService';

    bind(ctx: AppContext): Resource {
        this._ctx = ctx;
        return this;
    }

    async sendAttachment(fileMessage: { chatId: string; storeId: string; file: File }) {
        const store = this.connection().store(fileMessage.storeId);
        const fileId = await store.uploadFile({
            file: fileMessage.file,
            publicMeta: serializeObject({
                name: fileMessage.file.name,
                chatId: fileMessage.chatId,
                mimetype: fileMessage.file.type
            } satisfies StoreFilePublicData),
            privateMeta: serializeObject({})
        });
        return { attachmentId: fileId, attachmentName: fileMessage.file.name };
    }

    async downloadAttachment(attachmentId: string, name: string) {
        await this.connection().stores.downloadFile({ fileId: attachmentId, fileName: name });
    }
}
