import { AppEvent, Subscriber } from '@srs/AppBus';
import { Chat } from '@chat/logic/chat-system/types';

export class ThreadResourceSubscriber
    implements Subscriber<ThreadResourceEvent, ThreadResourceEventType>
{
    private callbacks: Map<
        ThreadResourceEventType['type'],
        Record<string, (event: ThreadResourceEventType) => void>
    > = new Map();
    public readonly scope;

    constructor(scope: string) {
        this.scope = scope;
    }

    // Start snippet [js-threads-hook]
    add<E extends ThreadResourceEventType['type']>(
        eventName: E,
        callback: (
            event: Extract<
                ThreadResourceEventType,
                {
                    type: E;
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

    //end snipptet
    notify(event: ThreadResourceEvent) {
        if (!this.callbacks.has(event.type)) return;
        const callbacks = this.callbacks.get(event.type);
        for (const cb of Object.values<(event: ThreadResourceEventType) => void>(callbacks)) {
            cb(event.payload);
        }
    }
}

type ThreadResourceEventType =
    | {
          type: 'created';
          payload: Chat;
      }
    | {
          type: 'updated';
          payload: Chat;
      }
    | {
          type: 'stats';
          payload: { lastMsgDate: number; messages: number; threadId: string };
      }
    | {
          type: 'deleted';
          payload: { threadId: string };
      };

export class ThreadResourceEvent implements AppEvent<ThreadResourceEventType> {
    public readonly payload: ThreadResourceEventType;
    public readonly scope: string;
    public readonly timestamp: number;

    public readonly type: ThreadResourceEventType['type'];

    static get eventName() {
        return 'ThreadResourceEvent';
    }

    get eventName(): string {
        return ThreadResourceEvent.eventName;
    }

    constructor(resourceName: string, payload: ThreadResourceEventType) {
        this.payload = payload;
        this.scope = resourceName;
        this.type = payload.type;
    }

    static createSubscriber<E extends ThreadResourceEventType['type']>(
        eventName: E,
        callback: (
            event: Extract<
                ThreadResourceEventType,
                {
                    type: E;
                }
            >
        ) => void
    ) {
        const subscriber = new ThreadResourceSubscriber(this.eventName);
        subscriber.add(eventName, callback as (event: ThreadResourceEventType) => void);
        return subscriber;
    }

    static newThread(payload: Chat) {
        return new ThreadResourceEvent(this.eventName, { type: 'created', payload });
    }

    static updatedThread(payload: Chat) {
        return new ThreadResourceEvent(this.eventName, { type: 'updated', payload });
    }

    static statsThread(payload: { lastMsgDate: number; messages: number; threadId: string }) {
        return new ThreadResourceEvent(this.eventName, { type: 'stats', payload });
    }

    static deletedThread(payload: { threadId: string }) {
        return new ThreadResourceEvent(this.eventName, { type: 'deleted', payload });
    }
}
