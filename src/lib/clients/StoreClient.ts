import { Endpoint } from '../endpoint-api/endpoint';

const CHUNK_SIZE = 1048576;

export type Asset = {
    name: string;
    data: Uint8Array;
    mimetype: string;
};
export class StoreClient {
    private _storeId: string;

    constructor(storeId: string) {
        this._storeId = storeId;
    }

    public get storeId() {
        return this._storeId;
    }

    public async downloadFile(id: string, name: string) {
        const asset = await this.getFile(id);

        const reader = new FileReader();
        const anchor = document.createElement('a');

        reader.onload = (e) => {
            anchor.href = e.target.result as string;
            anchor.download = name;
            anchor.click();
        };

        reader.readAsDataURL(new Blob([asset.data]));
    }

    protected async createNewFile(name: string, data: Uint8Array, mimeType: string) {
        const size = data.length;
        const endpoint = await Endpoint.getInstance();
        try {
            const handle = await endpoint.storeFileCreate(this._storeId, size, mimeType, name);

            let offset = 0;

            while (offset < size) {
                const nextChunkSize = Math.min(size - offset, CHUNK_SIZE);
                const chunk = data.slice(offset, offset + nextChunkSize);
                await endpoint.storeFileWrite(handle, chunk);
                offset += nextChunkSize;
            }
            return await endpoint.storeFileClose(handle);
        } catch (e) {
            console.error(e);
        }
        return '';
    }

    async sendNewFile(data: File) {
        const reader = new FileReader();

        return new Promise<string>(async (resolve) => {
            reader.onload = (event) => {
                const result = event.target.result;
                const uint8Array = new Uint8Array(result as ArrayBuffer);
                this.createNewFile(data.name, uint8Array, data.type).then((fileId) => {
                    resolve(fileId);
                });
            };
            reader.readAsArrayBuffer(data);
        });
    }

    async getFile(id: string): Promise<Asset> {
        const endpoint = await Endpoint.getInstance();
        const {
            data: { mimetype, name }
        } = await endpoint.storeFileGet(id);
        const handle = await endpoint.storeFileOpen(id);
        let data = new Uint8Array();
        while (true) {
            const chunk = await endpoint.storeFileRead(handle, 1048576);

            let newData = new Uint8Array(data.length + chunk.length);
            newData.set(data);
            newData.set(chunk, data.length);
            data = newData;

            if (chunk.length < 1048576) {
                break;
            }
        }

        await endpoint.storeFileClose(handle);

        return { data: data, mimetype: mimetype, name: name };
    }

    async updateFile(id: string, data: Uint8Array, offset: number = 0) {
        const endpoint = await Endpoint.getInstance();
        const handle = await endpoint.storeFileOpen(id);

        let localOffset = offset;
        const size = data.length;

        while (offset < data.length) {
            const nextChunkSize = Math.min(size - localOffset, CHUNK_SIZE);
            const chunk = data.slice(localOffset, localOffset + nextChunkSize);
            await endpoint.storeFileWrite(handle, chunk);
            localOffset += nextChunkSize;
        }
        return await endpoint.storeFileClose(handle);
    }

    static async overrideFile(fileId: string, data: Uint8Array, mimeType: string, name: string) {
        const endpoint = await Endpoint.getInstance();
        const size = data.length;

        const handle = await endpoint.storeFileUpdate(fileId, size, mimeType, name);

        let offset = 0;

        while (offset < size) {
            const nextChunkSize = Math.min(size - offset, CHUNK_SIZE);
            const chunk = data.slice(offset, offset + nextChunkSize);
            await endpoint.storeFileWrite(handle, chunk);
            offset += nextChunkSize;
        }
        return await endpoint.storeFileClose(handle);
    }
}
