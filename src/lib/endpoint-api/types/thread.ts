export interface ThreadInfo {
    contextId: string;
    threadId: string;
    createDate: number;
    creator: string;
    lastModificationDate: number;
    lastModifier: string;
    users: string[];
    managers: string[];
    version: number;
    lastMsgDate: number;
    messages: number;
    data: ThreadData;
}

export interface ThreadData {
    title: string;
}

export interface ThreadsList {
    threadsTotal: number;
    threads: ThreadInfo[];
}
