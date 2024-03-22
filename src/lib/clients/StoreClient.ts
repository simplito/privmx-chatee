import { Endpoint } from '../endpoint-api/endpoint';

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

    protected async createNewFile<T extends Uint8Array>(name: string, data: T, mimeType: string) {
        const size = data.length;
        const endpoint = await Endpoint.getInstance();
        try {
            return await endpoint.storeFileCreate(this._storeId, {
                mimetype: mimeType,
                name,
                data: data,
                size
            });
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
        const result = await endpoint.storeFileRead(id);

        return { data: result.data, mimetype: result.mimetype, name: result.name };
    }
}
