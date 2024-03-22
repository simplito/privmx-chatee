/* eslint-disable no-unused-vars */

import { ThreadInfo } from './types/thread';

export enum EndpointEventTypes {
    THREAD_CREATED = 'thread2Created',
    THREAD_UPDATED = 'thread2Updated',
    THREAD_NEW_MESSAGE = 'thread2NewMessage',
    STORE_CREATED = 'storeCreated',
    STORE_UPDATED = 'storeUpdated',
    STORE_STATS_CHANGED = 'storeStatsChanged',
    STORE_FILE_CREATED = 'storeFileCreated',
    STORE_FILE_UPDATED = 'storeFileUpdated',
    STORE_FILE_DELETED = 'storeFileDeleted',
    DISCONNECTED = 'libPlatformDisconnected'
}
export interface ThreadCreatedEvent {
    type: EndpointEventTypes.THREAD_CREATED;
    data: ThreadInfo;
}

export type EndpointApiEvent = ThreadCreatedEvent;

export class EndpointApiEvents {
    protected listeners = new Map<
        string,
        Array<{
            callback: (event: EndpointApiEvent) => void;
            id: number;
        }>
    >();
    private lastIndex = 0;

    addEventListener(type: EndpointApiEvent['type'], listener: (event: EndpointApiEvent) => void) {
        const listeners = this.listeners.get(type);
        if (listeners) {
            listeners.push({
                callback: listener,
                id: this.lastIndex++
            });
        } else {
            this.listeners.set(type, [
                {
                    callback: listener,
                    id: this.lastIndex++
                }
            ]);
        }

        return this.lastIndex;
    }

    removeEventListener(id: number) {
        for (const [, eventListeners] of this.listeners) {
            const index = eventListeners.findIndex((listener) => listener.id === id);
            if (index !== -1) {
                eventListeners.splice(index, 1);
                break;
            }
        }
    }

    dispatchEvent<T extends EndpointApiEvent>(event: T) {
        const listeners = this.listeners.get(event.type);
        if (!listeners) {
            return;
        }
        for (const listener of listeners) {
            try {
                listener.callback(event);
            } catch (e) {
                console.error('Error during calling event listener', e);
            }
        }
    }
}

export const endpointApiEvents = new EndpointApiEvents();
