import { UserContextType } from '@/shared/ui/context/UserContext';

export interface AppEvent<T> {
    payload: T;
    scope: string;
    eventName: string;
    timestamp: number;
    type: string;
}

export interface AppEventBus {
    emit: <T>(event: AppEvent<T>) => void;
    //TODO: unregister as returned function
    registerSubscriber: (subscriber: Subscriber<any, any>) => VoidFunction;
    unregisterAll: () => void;
}

export interface Subscriber<T extends AppEvent<P>, P, Callback = (event: P) => void> {
    scope: string;
    add: <E extends string>(eventName: any, callback: Callback) => VoidFunction;
    notify: (event: T) => void;
}

export class BrowserEventBus implements AppEventBus {
    private _subscribers = new Map<string, Map<symbol, Subscriber<any, any>>>();

    registerSubscriber(subscriber: Subscriber<any, any>) {
        const symbol = Symbol();
        if (this._subscribers.has(subscriber.scope)) {
            const currentCallbacks = this._subscribers.get(subscriber.scope);
            currentCallbacks.set(symbol, subscriber);
            this._subscribers.set(subscriber.scope, currentCallbacks);
        } else {
            const map = new Map();
            map.set(symbol, subscriber);
            this._subscribers.set(subscriber.scope, map);
        }
        return () => {
            const subscribers = this._subscribers.get(subscriber.scope);
            if (subscribers) {
                subscribers.delete(symbol);
            }
        };
    }

    emit<T>(event: AppEvent<T>) {
        if (!this._subscribers.has(event.scope)) return;
        const callbacks = this._subscribers.get(event.scope);

        for (const callback of callbacks.values()) {
            callback.notify(event);
        }
    }

    unregisterAll() {
        this._subscribers.clear();
    }
}

// implements Subscriber<UserEvent, UserEventType>
export class UserEventSubscriber implements Subscriber<UserEvent, UserEventType> {
    private callbacks: Map<
        UserEventType['action'],
        Record<string, (event: UserEventType) => void>
    > = new Map();
    public readonly scope;

    constructor(scope: string) {
        this.scope = scope;
    }

    add<E extends UserEventType['action']>(
        eventName: E,
        callback: (
            event: Extract<
                UserEventType,
                {
                    action: E;
                }
            >
        ) => void
    ) {
        const callbackSymbol = eventName;
        if (this.callbacks.has(eventName)) {
            const currentCallbacks = this.callbacks.get(eventName);
            // @ts-ignore
            this.callbacks.set(eventName, { ...currentCallbacks, [callbackSymbol]: callback });
        } else {
            // @ts-ignore
            this.callbacks.set(eventName, { [callbackSymbol]: callback });
        }
        return () => {
            const callbacks = this.callbacks.get(eventName);
            delete callbacks[callbackSymbol];
            return;
        };
    }

    notify(event: UserEvent) {
        if (!this.callbacks.has(event.action)) return;
        const callbacks = this.callbacks.get(event.action);
        for (const cb of Object.values<(event: UserEventType) => void>(callbacks)) {
            cb(event.payload);
        }
    }
}

type UserEventType =
    | {
          action: 'navigate';
          newPage: string;
      }
    | {
          action: 'page_enter';
          page: string;
          chatId: string;
          storeId: string;
      }
    | {
          action: 'page_leave';
          page: string;
          chatId: string;
          storeId: string;
      }
    | {
          action: 'sign_in';
          context: UserContextType;
      }
    | {
          action: 'sign_out';
      };

export class UserEvent implements AppEvent<UserEventType> {
    public readonly action: UserEventType['action'];
    public readonly scope: string;
    public readonly timestamp: number;
    public readonly payload: UserEventType;
    public readonly type: string;

    static get eventName() {
        return 'UserEvent';
    }

    get eventName(): string {
        return UserEvent.eventName;
    }

    static createSubscriber<E extends UserEventType['action']>(
        eventName: E,
        callback: (
            event: Extract<
                UserEventType,
                {
                    action: E;
                }
            >
        ) => void
    ) {
        const subscriber = new UserEventSubscriber(this.eventName);
        subscriber.add(eventName, callback as (event: UserEventType) => void);
        return subscriber;
    }

    constructor(payload: UserEventType) {
        this.payload = payload;
        this.action = payload.action;
        this.scope = 'UserEvent';
    }

    static pageEnter(page: string, chatId: string, storeId: string) {
        return new UserEvent({ action: 'page_enter', page, chatId, storeId });
    }

    static signIn(context: UserContextType) {
        return new UserEvent({ action: 'sign_in', context });
    }

    static signOut() {
        return new UserEvent({ action: 'sign_out' });
    }

    static pageLeave(page: string, chatId: string, storeId: string) {
        return new UserEvent({ action: 'page_leave', page, chatId, storeId });
    }
}
