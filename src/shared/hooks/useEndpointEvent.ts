import { useEffect } from 'react';
import {
    EndpointEventTypes,
    EndpointEventManager,
    EndpointApiEvent
} from '@/lib/endpoint-api/types/events';

export function useEndpointEvent<T extends EndpointEventTypes>(
    eventType: T,
    // eslint-disable-next-line no-unused-vars
    callback: (event: Extract<EndpointApiEvent, { type: T }>) => void
) {
    useEffect(() => {
        EndpointEventManager.addEventListener(eventType, callback);

        return () => {
            EndpointEventManager.removeEventListener(eventType, callback);
        };
    }, [eventType, callback]);
}
