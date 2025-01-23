'use client';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useUserContext } from '../ui/context/UserContext';
import { Endpoint } from '@simplito/privmx-webendpoint';
import { EndpointConnectionManager } from '@lib/endpoint-api/endpoint';

const EndpointContext = createContext<Awaited<ReturnType<typeof Endpoint.connect>>>(undefined);

export function useEndpointContext() {
    const ctx = useContext(EndpointContext);

    if (!ctx) {
        throw new Error('useEndPointContext can only be used in a EndpointContextProvider');
    }

    return ctx;
}

export function EndpointContextProvider({ children }: { children: ReactNode }) {
    const {
        state: { userStatus }
    } = useUserContext();
    const [context, setContext] = useState<Awaited<ReturnType<typeof Endpoint.connect>>>();

    useEffect(() => {
        (async () => {
            if (userStatus === 'logged-in') {
                setContext(await EndpointConnectionManager.getConnection());
            } else {
                setContext(null);
            }
        })();
    }, [userStatus]);

    return <EndpointContext.Provider value={context}>{children}</EndpointContext.Provider>;
}
