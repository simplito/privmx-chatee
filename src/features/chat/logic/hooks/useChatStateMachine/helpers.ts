import { ChatMessage } from '@chat/data';
import type { Event, State } from './types';
import { toChatMessage, toSendMessage } from '@chat/logic';

export function toEventObj(
    connectionTarget:
        | State['status']
        | {
              target: State['status'];
              // eslint-disable-next-line no-unused-vars
              guard: (state: State) => boolean;
          }[]
) {
    return typeof connectionTarget === 'string'
        ? [{ target: connectionTarget, guard: () => true }]
        : connectionTarget;
}

export function getMessageId(msg: ChatMessage) {
    return msg.status === 'pending' ? msg.msgId : msg.messageId;
}

export function getNextMessages(
    state: State,
    event: Event
): [messages: ChatMessage[], pendingMessages: ChatMessage[]] {
    const currentPendingMessages = 'pendingMessages' in state ? state.pendingMessages : [];
    if (event.type === 'NEW_MESSAGE') {
        const newPendingMessages = [...currentPendingMessages, event.newMessage];

        return [state.messages, newPendingMessages];
    }

    if (event.type === 'DELETE_MESSAGE') {
        const newMessages = state.messages.filter((x) => {
            const isTheSame = getMessageId(x) !== event.deletedMessage.msgId;
            return isTheSame;
        });
        return [newMessages, state.pendingMessages];
    }

    if (event.type === 'SETTLE_MESSAGE') {
        let settledMessage: ChatMessage | undefined = undefined;
        const newPendingMessages = currentPendingMessages.filter((pendingMsg) => {
            const isTargetMessage = getMessageId(pendingMsg) === event.newMessage.msgId;

            if (isTargetMessage && pendingMsg.status === 'pending') {
                settledMessage = toSendMessage(event.newMessage.info.messageId, pendingMsg);
            }

            return !isTargetMessage;
        });

        settledMessage = settledMessage ? settledMessage : toChatMessage(event.newMessage);

        const newMessages = settledMessage ? [...state.messages, settledMessage] : state.messages;

        return [newMessages, newPendingMessages];
    }

    if ('newMessages' in event && event.newMessages) {
        const newMessages = event.newMessages.slice();

        return [newMessages, currentPendingMessages];
    }

    return [state.messages, currentPendingMessages];
}
