import { AppEvent, Subscriber } from '@srs/AppBus';

import { ChatMessage } from '@chat/logic/messages-system/types';

class MessageResourceSubscriber
    implements Subscriber<MessageResourceEvent, MessageResourceEventType>
{
    private callbacks: Map<
        MessageResourceEventType['type'],
        Record<string, (event: MessageResourceEventType) => void>
    > = new Map();
    public readonly scope;

    constructor(scope: string) {
        this.scope = scope;
    }

    add<E extends MessageResourceEventType['type']>(
        eventName: E,
        callback: (
            event: Extract<
                MessageResourceEventType,
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

    notify(event: MessageResourceEvent) {
        if (!this.callbacks.has(event.type)) return;
        const callbacks = this.callbacks.get(event.type);
        for (const cb of Object.values<(event: MessageResourceEventType) => void>(callbacks)) {
            cb(event.payload);
        }
    }
}

type MessageResourceEventType =
    | {
          type: 'new';
          payload: ChatMessage;
      }
    | {
          type: 'deleted';
          payload: { messageId: string; chatId: string };
      };

export class MessageResourceEvent implements AppEvent<MessageResourceEventType> {
    public readonly payload: MessageResourceEventType;
    public readonly scope: string;
    public readonly timestamp: number;

    public readonly type: MessageResourceEventType['type'];

    static get eventName() {
        return 'MessageResourceEvent';
    }

    get eventName(): string {
        return MessageResourceEvent.eventName;
    }

    constructor(resourceName: string, payload: MessageResourceEventType) {
        this.payload = payload;
        this.scope = resourceName;
        this.type = payload.type;
    }

    static createSubscriber<E extends MessageResourceEventType['type']>(
        eventName: E,
        callback: (
            event: Extract<
                MessageResourceEventType,
                {
                    type: E;
                }
            >
        ) => void
    ) {
        const subscriber = new MessageResourceSubscriber(this.eventName);
        subscriber.add(eventName, callback as (event: MessageResourceEventType) => void);
        return subscriber;
    }

    static newMessage(payload: ChatMessage) {
        return new MessageResourceEvent(this.eventName, { type: 'new', payload });
    }

    static deletedMessage(payload: { chatId: string; messageId: string }) {
        return new MessageResourceEvent(this.eventName, { type: 'deleted', payload });
    }
}
