import { AppEvent, Subscriber } from '@srs/AppBus';
import { ChatAttachment } from '@chat/logic';

class FileResourceSubscriber implements Subscriber<FileResourceEvent, FileResourceEventType> {
    private callbacks: Map<
        FileResourceEventType['type'],
        Record<string, (event: FileResourceEventType) => void>
    > = new Map();
    public readonly scope;

    constructor(scope: string) {
        this.scope = scope;
    }

    add<E extends FileResourceEventType['type']>(
        eventName: E,
        callback: (
            event: Extract<
                FileResourceEventType,
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

    notify(event: FileResourceEvent) {
        if (!this.callbacks.has(event.type)) return;
        const callbacks = this.callbacks.get(event.type);
        for (const cb of Object.values<(event: FileResourceEventType) => void>(callbacks)) {
            cb(event.payload);
        }
    }
}

type FileResourceEventType =
    | {
          type: 'new';
          payload: ChatAttachment;
      }
    | {
          type: 'deleted';
          payload: { attachmentId: string; storeId: string; chatId: string };
      };

export class FileResourceEvent implements AppEvent<FileResourceEventType> {
    public readonly payload: FileResourceEventType;
    public readonly scope: string;
    public readonly timestamp: number;

    public readonly type: FileResourceEventType['type'];

    static get eventName() {
        return 'FileResourceEvent';
    }

    get eventName(): string {
        return FileResourceEvent.eventName;
    }

    constructor(resourceName: string, payload: FileResourceEventType) {
        this.payload = payload;
        this.scope = resourceName;
        this.type = payload.type;
    }

    static createSubscriber<E extends FileResourceEventType['type']>(
        eventName: E,
        callback: (
            event: Extract<
                FileResourceEventType,
                {
                    type: E;
                }
            >
        ) => void
    ) {
        const subscriber = new FileResourceSubscriber(this.eventName);
        subscriber.add(eventName, callback as (event: FileResourceEventType) => void);
        return subscriber;
    }

    static newAttachment(payload: ChatAttachment) {
        return new FileResourceEvent(this.eventName, { type: 'new', payload });
    }

    static deletedAttachment(payload: { chatId: string; attachmentId: string; storeId: string }) {
        return new FileResourceEvent(this.eventName, { type: 'deleted', payload });
    }
}
