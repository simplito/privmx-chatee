export interface StoreData {
    name: string;
}

export interface StoreInfo {
    contextId: string;
    storeId: string;
    filesCount: number;
    data: StoreData;
}

export interface StoreList {
    storesTotal: number;
    stores: StoreInfo[];
}

export interface StoreFileDataAuthor {
    pubKey: string;
}

export interface StoreFileDataDestination {
    server: string;
    contextId: string;
    storeId: string;
}

export interface StoreFileInfoData {
    name: string;
    mimetype: string;
    size: number;
    author: StoreFileDataAuthor;
    destination: StoreFileDataDestination;
}

export interface StoreFileInfo {
    storeId: string;
    fileId: string;
    createDate: number;
    author: string;
    date: number;
    size: number;
    data: StoreFileInfoData;
}

export interface StoreFilesList {
    filesTotal: number;
    files: StoreFileInfo[];
}

export interface StoreFileData {
    mimetype: string;
    name: string;
    data: Uint8Array;
    size: number;
}

export interface StoreStatsChangedEventData {
    contextId: string;
    storeId: string;
    lastFileDate: number;
    files: number;
}

export interface StoreFileDeletedEventData {
    contextId: string;
    storeId: string;
    fileId: string;
}
