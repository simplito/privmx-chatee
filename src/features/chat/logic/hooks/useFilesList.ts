import { useCallback, useEffect, useState } from 'react';
import { FormStatus } from '@/shared/utils/types';
import { usePagination } from '@mantine/hooks';
import { useThreadContext } from '..';
import {
    FILE_PAGE_SIZE,
    loadPageAction,
    startPageLoadAction,
    useStoreCache
} from './StoreCacheContext';
import { useEndpointContext } from '@/shared/hooks/useEndpointContext';
import { useMessagesSystem } from '@srs/ReactBindings';

export function useFilesList() {
    const [status, setStatus] = useState<FormStatus>('loading');
    const { state: cacheState, dispatch } = useStoreCache();
    const [totalPages, setTotalPages] = useState(1);
    const { active, setPage } = usePagination({
        total: totalPages,
        initialPage: 1
    });

    const client = useThreadContext();
    const messageSystem = useMessagesSystem();
    const platformCtx = useEndpointContext();

    const loadFiles = useCallback(async () => {
        const storeId = client.storeId;
        const currentPage = active;

        try {
            setStatus('loading');
            const storeCache = cacheState.stores.get(storeId);
            const pageStatus = storeCache?.pageStatuses.get(currentPage);

            if (!pageStatus?.isLoaded && !pageStatus?.isLoading) {
                dispatch(startPageLoadAction({ storeId, page: currentPage }));

                const attachmentsList = await messageSystem.getChatFiles(
                    client.chatId,
                    currentPage - 1
                );

                dispatch(
                    loadPageAction({
                        storeId,
                        files: attachmentsList.attachments,
                        page: currentPage
                    })
                );
            }
            setStatus('success');
        } catch (e) {
            console.log(e);
            setStatus('error');
        }
    }, [cacheState.stores, dispatch, client.storeId, active, platformCtx]);

    useEffect(() => {
        const storeCache = cacheState.stores.get(client.storeId);
        if (storeCache) {
            const newTotalPages = Math.max(1, Math.ceil(storeCache.filesCount / FILE_PAGE_SIZE));
            if (totalPages !== newTotalPages) {
                setTotalPages(newTotalPages);
            }
        }
    }, [cacheState.stores, client.storeId, totalPages]);

    useEffect(() => {
        loadFiles();
    }, [loadFiles, active]);

    const storeCache = cacheState.stores.get(client.storeId);
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
