import { Resource, Service } from '@srs/App';
import { AppContext } from '@srs/AppContext';
import { StoreFilePublicData } from '@chat/logic/messages-system/types';
import { EndpointConnectionManager } from '@lib/endpoint-api/endpoint';
import { downloadFile, FileUploader, Utils } from '@simplito/privmx-webendpoint/extra';

export class ThreadFileService implements Service {
    private _ctx: AppContext;

    getName = () => 'FilesService';

    bind(ctx: AppContext): Resource {
        this._ctx = ctx;
        return this;
    }

    async api() {
        return await EndpointConnectionManager.getStoreApi();
    }

    async sendAttachment(fileMessage: { chatId: string; storeId: string; file: File }) {
        const storeApi = await this.api();
        const streamer = await FileUploader.uploadStoreFile({
            storeApi,
            file: fileMessage.file,
            storeId: fileMessage.storeId,
            privateMeta: Utils.serializeObject({}),
            publicMeta: Utils.serializeObject({
                name: fileMessage.file.name,
                chatId: fileMessage.chatId,
                mimetype: fileMessage.file.type
            } satisfies StoreFilePublicData)
        });

        const fileId = (await streamer.uploadFileContent()) as unknown as string;

        return { attachmentId: fileId, attachmentName: fileMessage.file.name };
    }

    async downloadAttachment(attachmentId: string, name: string) {
        const storeApi = await this.api();
        await downloadFile(storeApi, attachmentId, name);
    }
}
