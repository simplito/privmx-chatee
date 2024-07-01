import { useCallback, useEffect, useState } from 'react';
import { FormStatus } from '@/shared/utils/types';
import { usePagination } from '@mantine/hooks';
import { Endpoint } from '@simplito/privmx-endpoint-web-sdk';
import { useThreadContext } from '..';
import {
    FILE_PAGE_SIZE,
    loadPageAction,
    startPageLoadAction,
    useStoreCache
} from './StoreCacheContext';

export function useFilesList() {
    const [status, setStatus] = useState<FormStatus>('loading');
    const { state: cacheState, dispatch } = useStoreCache();
    const [totalPages, setTotalPages] = useState(1);
    const { active, setPage } = usePagination({
        total: totalPages,
        initialPage: 1
    });

    const client = useThreadContext();

    const loadFiles = useCallback(async () => {
        const storeId = client.chatInfo.storeId;
        const currentPage = active;

        try {
            setStatus('loading');
            const storeCache = cacheState.stores.get(storeId);
            const pageStatus = storeCache?.pageStatuses.get(currentPage);

            if (!pageStatus?.isLoaded && !pageStatus?.isLoading) {
                dispatch(startPageLoadAction({ storeId, page: currentPage }));

                const endpoint = await Endpoint.getInstance();
                const filesList = await endpoint.storeFileList(
                    storeId,
                    (currentPage - 1) * FILE_PAGE_SIZE,
                    FILE_PAGE_SIZE,
                    'desc'
                );

                dispatch(loadPageAction({ storeId, files: filesList.files, page: currentPage }));
            }
            setStatus('success');
        } catch (e) {
            setStatus('error');
        }
    }, [cacheState.stores, dispatch, client.chatInfo.storeId, active]);

    useEffect(() => {
        const storeCache = cacheState.stores.get(client.chatInfo.storeId);
        if (storeCache) {
            const newTotalPages = Math.max(1, Math.ceil(storeCache.filesCount / FILE_PAGE_SIZE));
            if (totalPages !== newTotalPages) {
                setTotalPages(newTotalPages);
            }
        }
    }, [cacheState.stores, client.chatInfo.storeId, totalPages]);

    useEffect(() => {
        loadFiles();
    }, [loadFiles, active]);

    const storeCache = cacheState.stores.get(client.chatInfo.storeId);
    const files = storeCache ? storeCache.files.get(active) || [] : [];

    return {
        files,
        loadFiles,
        status,
        goToPage: setPage,
        total: totalPages,
        activePage: active
    };
}
