import { ChatMessage } from '@chat/logic/messages-system/types';

export type GroupedMessages = {
    messages: ChatMessage[];
    author: string;
};

const TIME_DIFF = 60 * 1000 * 3; // 3 mins

export function groupMessages(messages: ChatMessage[]): GroupedMessages[] {
    const groups: GroupedMessages[] = [];
    let currentGroup: GroupedMessages = undefined;

    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const prevMessage = currentGroup?.messages.at(-1);

        if (!currentGroup) {
            currentGroup = {
                author: message.author,
                messages: [message]
            };
            continue;
        }

        if (
            message.author !== currentGroup.author ||
            message.sentDate - prevMessage.sentDate > TIME_DIFF
        ) {
            groups.push(currentGroup);
            currentGroup = {
                author: message.author,
                messages: [message]
            };
            continue;
        }

        currentGroup.messages.push(message);
    }
    if (currentGroup) {
        groups.push(currentGroup);
    }
    return groups;
}
