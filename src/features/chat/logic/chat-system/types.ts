export interface Chat {
    title: string;
    creationDate: number;
    storeId: string;
    users: string[];
    managers: string[];
    chatId: string;
    lastMessageDate: number;
    creator: string;
    contextId: string;
}

export interface ChatWithReadState extends Chat {
    lastReadMessageDate: number;
    lastMessageDate: number;
}

export interface ThreadPrivateData {
    name: string;
    storeId: string;
}

export interface ThreadUsers {
    userId: string;
    publicKey: string;
    isAdmin: boolean;
}
