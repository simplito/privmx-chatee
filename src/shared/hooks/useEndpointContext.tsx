'use client';
import { Endpoint } from '@simplito/privmx-webendpoint-sdk';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useUserContext } from '../ui/context/UserContext';
import { useApp } from '@srs/ReactBindings';

const platformContext = createContext(undefined);

export function useEndpointContext() {
    return useContext(platformContext);
}

export function EndpointContextProvider({ children }: { children: ReactNode }) {
    const app = useApp();
    const {
        state: { userStatus }
    } = useUserContext();
    const [context, setContext] = useState<Endpoint>();

    const contextId = app.context.user?.contextId;

    useEffect(() => {
        if (userStatus === 'logged-in') {
            setContext(Endpoint.connection());
        } else {
            setContext(null);
        }
    }, [contextId, userStatus]);

    return <platformContext.Provider value={context}>{children}</platformContext.Provider>;
}
