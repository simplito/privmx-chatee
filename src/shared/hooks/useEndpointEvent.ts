'use client';

import { EndpointApiEvent, Platform } from '@simplito/privmx-endpoint-web-sdk';
import { useEffect } from 'react';

type ExtractEvent<T extends EndpointApiEvent['type']> = Extract<EndpointApiEvent, { type: T }>;

export function useEndpointEvent<T extends EndpointApiEvent['type']>(
    eventType: T,
    // eslint-disable-next-line no-unused-vars
    callback: (event: ExtractEvent<T>) => void
) {
    useEffect(() => {
        const connection = Platform.getCurrent();

        if (!connection) {
            return () => {};
        }

        const removeListener = connection.addEventListener(eventType, callback);

        return () => {
            removeListener();
        };
    }, [eventType, callback]);
}
