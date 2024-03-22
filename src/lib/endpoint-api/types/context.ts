export interface ContextInfo {
    userId: string[];
    contextId: string;
}

export interface ContextsList {
    contextsTotal: number;
    contexts: ContextInfo[];
}
