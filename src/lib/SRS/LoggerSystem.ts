import { BindInfo, System } from '@srs/App';
import { UserEvent } from './AppBus';
import { ThreadResourceEvent } from '@srs/ThreadResourceEvent';
import { MessageResourceEvent } from '@chat/logic/messages-system/MessageResourceEvent';

export class LoggerSystem implements System {
    getName(): string {
        return 'LoggerSystem';
    }

    bind({ bus }: BindInfo) {
        const subscriber = UserEvent.createSubscriber('sign_in', (userContext) => {
            console.log('User signed in', userContext);
        });
        subscriber.add('page_enter', (page) => {
            console.log('Page enter', page, page.chatId);
        });
        subscriber.add('page_leave', (page) => {
            console.log('Page leave', page, page.chatId);
        });
        subscriber.add('sign_out', (userContext) => {
            console.log('User signed out', userContext);
        });
        const threadSubscriber = ThreadResourceEvent.createSubscriber('created', (newChat) => {
            console.log('New Chat', newChat);
        });

        const messageSubscriber = MessageResourceEvent.createSubscriber('new', (payload) => {
            console.log('New Message received', payload);
        });

        bus.registerSubscriber(subscriber);
        bus.registerSubscriber(threadSubscriber);
        bus.registerSubscriber(messageSubscriber);

        return this;
    }
}
