import {
    StoreFileDeletedEventData,
    StoreFileInfo,
    StoreInfo,
    StoreStatsChangedEventData
} from './store';
import { ThreadInfo } from './thread';
import { ThreadMessage } from './threadMessage';

/* eslint-disable no-unused-vars */

export enum EndpointEventTypes {
    THREAD_CREATED = 'thread2Created',
    THREAD_UPDATED = 'thread2Updated',
    THREAD_NEW_MESSAGE = 'thread2NewMessage',
    THREAD_DELETED = 'thread2Deleted',
    THREAD_DELETED_MESSAGE = 'thread2DeletedMessage',
    STORE_CREATED = 'storeCreated',
    STORE_UPDATED = 'storeUpdated',
    STORE_STATS_CHANGED = 'storeStatsChanged',
    STORE_FILE_CREATED = 'storeFileCreated',
    STORE_FILE_UPDATED = 'storeFileUpdated',
    STORE_FILE_DELETED = 'storeFileDeleted',
    DISCONNECTED = 'libPlatformDisconnected',
    LIBDISCONNECTED = 'libDisconnected'
}
export interface ThreadCreatedEvent {
    type: EndpointEventTypes.THREAD_CREATED;
    data: ThreadInfo;
}

export interface ThreadUpdatedEvent {
    type: EndpointEventTypes.THREAD_UPDATED;
    data: ThreadInfo;
}

export interface ThreadDeletedEvent {
    type: EndpointEventTypes.THREAD_DELETED;
    data: {
        threadId: string;
    };
}

export interface ThreadNewMessageEvent {
    type: EndpointEventTypes.THREAD_NEW_MESSAGE;
    data: ThreadMessage;
}

export interface ThreadDeletedMessageEvent {
    type: EndpointEventTypes.THREAD_DELETED_MESSAGE;
    data: {
        messageId: string;
        threadId: string;
    };
}

export interface StoreCreatedEvent {
    type: EndpointEventTypes.STORE_CREATED;
    data: StoreInfo;
}

export interface StoreUpdatedEvent {
    type: EndpointEventTypes.STORE_UPDATED;
    data: StoreInfo;
}

export interface StoreStatsChangedEvent {
    type: EndpointEventTypes.STORE_STATS_CHANGED;
    data: StoreStatsChangedEventData;
}

export interface StoreFileCreatedEvent {
    type: EndpointEventTypes.STORE_FILE_CREATED;
    data: StoreFileInfo;
}

export interface StoreFileUpdatedEvent {
    type: EndpointEventTypes.STORE_FILE_UPDATED;
    data: StoreFileInfo;
}

export interface StoreFileDeletedEvent {
    type: EndpointEventTypes.STORE_FILE_DELETED;
    data: StoreFileDeletedEventData;
}

export interface DisconnectedEvent {
    type: EndpointEventTypes.DISCONNECTED;
    data?: {
        type: 'time-out';
    };
}

export type EndpointApiEvent =
    | ThreadCreatedEvent
    | ThreadUpdatedEvent
    | ThreadNewMessageEvent
    | StoreCreatedEvent
    | StoreUpdatedEvent
    | StoreStatsChangedEvent
    | StoreFileCreatedEvent
    | StoreFileUpdatedEvent
    | StoreFileDeletedEvent
    | DisconnectedEvent
    | ThreadDeletedEvent
    | ThreadDeletedMessageEvent;

class EventDispatcher {
    listeners: { [key: string]: Function[] };

    constructor() {
        this.listeners = {};
    }

    addEventListener(eventType: string, callback: Function) {
        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }
        this.listeners[eventType].push(callback);
    }

    removeEventListener(eventType: string, callback: Function) {
        if (this.listeners[eventType]) {
            this.listeners[eventType] = this.listeners[eventType].filter((cb) => cb !== callback);
        }
    }

    dispatchEvent(event: any) {
        const eventType = event.type;
        if (this.listeners[eventType]) {
            this.listeners[eventType].forEach((callback) => callback(event));
        }
    }
}

const eventDispatcher = new EventDispatcher();

export class EndpointEventManager {
    static addEventListener(eventType: string, callback: Function) {
        eventDispatcher.addEventListener(eventType, callback);
    }

    static removeEventListener(eventType: string, callback: Function) {
        eventDispatcher.removeEventListener(eventType, callback);
    }

    static dispatchEvent(event: any) {
        eventDispatcher.dispatchEvent(event);
    }
}
