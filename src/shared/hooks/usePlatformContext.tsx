'use client';

import { Platform, PlatformContext } from '@simplito/privmx-endpoint-web-sdk';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useUserContext } from '../ui/context/UserContext';

const platformContext = createContext(Platform.context(''));

export function usePlatformContext() {
    return useContext(platformContext);
}

export function PlatformContextProvider({ children }: { children: ReactNode }) {
    const {
        state: { contextId }
    } = useUserContext();
    const [context, setContext] = useState<PlatformContext>();

    useEffect(() => {
        setContext(Platform.context(contextId));
    }, [contextId]);

    return <platformContext.Provider value={context}>{children}</platformContext.Provider>;
}
