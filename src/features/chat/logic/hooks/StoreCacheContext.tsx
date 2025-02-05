/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { useEndpointContext } from '@/shared/hooks/useEndpointContext';
import { useApp } from '@srs/ReactBindings';
import { ChatAttachment, FileResourceEvent, useThreadContext } from '@chat/logic';
import { EndpointConnectionManager } from '@lib/endpoint-api/endpoint';
import { Store } from '@simplito/privmx-webendpoint/Types';

type StoreState = 'None' | 'InfoInitialized';

export const FILE_PAGE_SIZE = 30;

interface PageStatus {
    isLoading: boolean;
    isLoaded: boolean;
}

export interface StoreCacheInfo extends Store {
    files: Map<number, ChatAttachment[]>;
    state: StoreState;
    pagesLoaded: number[];
    pageStatuses: Map<number, PageStatus>;
}

export interface StoreCacheType {
    stores: Map<string, StoreCacheInfo>;
}

const initialState: StoreCacheType = {
    stores: new Map<string, StoreCacheInfo>()
};

export enum StoreCacheActionTypes {
    INIT_INFO = 'INIT_INFO',
    ADD_FILES = 'ADD_FILES',
    LOAD_PAGE = 'LOAD_PAGE',
    RESET_CACHE = 'RESET_CACHE',
    START_PAGE_LOAD = 'START_PAGE_LOAD',
    DELETE_FILE = 'DELETE_FILE'
}

interface InitInfoAction {
    type: StoreCacheActionTypes.INIT_INFO;
    payload: Store;
}

interface AddFilesAction {
    type: StoreCacheActionTypes.ADD_FILES;
    payload: {
        storeId: string;
        files: ChatAttachment[];
    };
}

interface LoadPageAction {
    type: StoreCacheActionTypes.LOAD_PAGE;
    payload: {
        storeId: string;
        files: ChatAttachment[];
        page: number;
    };
}

interface DeleteFileAction {
    type: StoreCacheActionTypes.DELETE_FILE;
    payload: {
        storeId: string;
        fileId: string;
    };
}

interface ResetCacheAction {
    type: StoreCacheActionTypes.RESET_CACHE;
}

interface StartPageLoadAction {
    type: StoreCacheActionTypes.START_PAGE_LOAD;
    payload: {
        storeId: string;
        page: number;
    };
}

type StoreCacheAction =
    | InitInfoAction
    | AddFilesAction
    | LoadPageAction
    | ResetCacheAction
    | StartPageLoadAction
    | DeleteFileAction;

export const StoreCacheContext = createContext<{
    state: StoreCacheType;
    dispatch: React.Dispatch<StoreCacheAction>;
}>({
    state: initialState,
    dispatch: () => null
});

function storeCacheReducer(state: StoreCacheType, action: StoreCacheAction): StoreCacheType {
    switch (action.type) {
        case StoreCacheActionTypes.INIT_INFO: {
            const newState = { ...state };
            const storeInfo: StoreCacheInfo = {
                ...action.payload,
                files: new Map<number, ChatAttachment[]>(),
                state: 'InfoInitialized',
                pagesLoaded: [],
                pageStatuses: new Map<number, PageStatus>()
            };
            newState.stores.set(storeInfo.storeId, storeInfo);
            return newState;
        }

        case StoreCacheActionTypes.ADD_FILES: {
            const { storeId, files } = action.payload;
            const newState = { ...state };
            const store = newState.stores.get(storeId);

            if (store) {
                const newFilesPage = Math.ceil((store.filesCount + 1) / FILE_PAGE_SIZE);
                const existingFilesForPage = store.files.get(newFilesPage) || [];

                store.files.set(newFilesPage, [...files, ...existingFilesForPage]);
                store.filesCount += files.length;
                store.pagesLoaded.push(newFilesPage);

                if (!store.pageStatuses.has(newFilesPage)) {
                    store.pageStatuses.set(newFilesPage, { isLoading: false, isLoaded: true });
                }

                newState.stores.set(storeId, store);
            }

            return newState;
        }

        case StoreCacheActionTypes.LOAD_PAGE: {
            const { storeId, files, page } = action.payload;
            const newState = { ...state };
            const store = newState.stores.get(storeId);

            if (store) {
                store.files.set(page, files);
                store.pagesLoaded.push(page);

                store.pageStatuses.set(page, { isLoading: false, isLoaded: true });

                newState.stores.set(storeId, store);
            }

            return newState;
        }

        case StoreCacheActionTypes.RESET_CACHE: {
            return initialState;
        }

        case StoreCacheActionTypes.START_PAGE_LOAD: {
            const { storeId, page } = action.payload;
            const newState = { ...state };
            const store = newState.stores.get(storeId);
            if (store) {
                store.pageStatuses.set(page, { isLoading: true, isLoaded: false });

                newState.stores.set(storeId, store);
            }
            return newState;
        }

        case StoreCacheActionTypes.DELETE_FILE: {
            const { storeId, fileId } = action.payload;
            const newState = { ...state };
            const store = newState.stores.get(storeId);
            if (store) {
                store.files.forEach((files, page) => {
                    const fileIndex = files.findIndex((file) => file.attachmentId === fileId);
                    if (fileIndex > -1) {
                        const updatedFiles = [
                            ...files.slice(0, fileIndex),
                            ...files.slice(fileIndex + 1)
                        ];
                        if (updatedFiles.length > 0) {
                            store.files.set(page, updatedFiles);
                        } else {
                            store.files.delete(page);
                        }

                        store.filesCount -= 1;
                    }
                });

                newState.stores.set(storeId, store);
            }

            return newState;
        }

        default:
            return state;
    }
}

export function storeInfoInitAction(payload: Store): InitInfoAction {
    return {
        type: StoreCacheActionTypes.INIT_INFO,
        payload
    };
}

export function addFilesToCache(payload: {
    storeId: string;
    files: ChatAttachment[];
}): AddFilesAction {
    return {
        type: StoreCacheActionTypes.ADD_FILES,
        payload
    };
}

export function deleteFilesFromCache(payload: {
    storeId: string;
    fileId: string;
}): DeleteFileAction {
    return {
        type: StoreCacheActionTypes.DELETE_FILE,
        payload
    };
}

export function loadPageAction(payload: {
    storeId: string;
    files: ChatAttachment[];
    page: number;
}): LoadPageAction {
    return {
        type: StoreCacheActionTypes.LOAD_PAGE,
        payload
    };
}

export function resetCacheAction() {
    return {
        type: StoreCacheActionTypes.RESET_CACHE
    };
}

export function startPageLoadAction(payload: {
    storeId: string;
    page: number;
}): StartPageLoadAction {
    return {
        type: StoreCacheActionTypes.START_PAGE_LOAD,
        payload
    };
}

export function StoreCacheContextProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(storeCacheReducer, initialState);
    const threadClient = useThreadContext();
    const app = useApp();
    const contextId = app.context.user.contextId;

    useEffect(() => {
        const subscriber = FileResourceEvent.createSubscriber('new', (payload) => {
            try {
                const store = state.stores.get(payload.payload.storeId);
                if (!store) {
                    return;
                }

                dispatch(
                    addFilesToCache({
                        storeId: payload.payload.storeId,
                        files: [payload.payload]
                    })
                );
            } catch (error) {
                console.error(error);
            }
        });
        subscriber.add('deleted', (file) => {
            const store = state.stores.get(file.payload.storeId);
            if (!store) {
                return;
            }
            dispatch(
                deleteFilesFromCache({
                    storeId: file.payload.storeId,
                    fileId: file.payload.attachmentId
                })
            );
        });
        const unsubscribe = app.eventBus.registerSubscriber(subscriber);
        return unsubscribe;
    }, [app.eventBus, state.stores]);

    useEffect(() => {
        (async () => {
            try {
                if (!contextId) {
                    return;
                }

                if (contextId && threadClient?.storeId) {
                    const isInitialized = state.stores.get(threadClient?.storeId);
                    if (!isInitialized) {
                        const storeApi =
                            await EndpointConnectionManager.getInstance().getStoreApi();
                        const store = await storeApi.getStore(threadClient.storeId);
                        dispatch(storeInfoInitAction(store));
                    }
                }
            } catch (e) {
                console.error(e);
            }
        })();
    }, [contextId, threadClient?.storeId, state.stores]);

    return (
        <StoreCacheContext.Provider value={{ state, dispatch }}>
            {children}
        </StoreCacheContext.Provider>
    );
}

export function useStoreCache() {
    const context = useContext(StoreCacheContext);

    if (!context) {
        throw new Error('useStoreCache must be used inside a StoreCacheContextProvider');
    }

    return context;
}
