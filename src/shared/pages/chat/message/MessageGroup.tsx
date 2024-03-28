import { Group, Stack } from '@mantine/core';
import { MessageContent } from './MessageContent';
import { GroupedMessages } from './groupMessages';
import { UserAvatar } from '@/shared/ui/atoms/user-avatar/UserAvatar';

const avatarSize = 'calc(2 * 1em * var(--mantine-line-height-sm))';

export function MessageGroup({
    group,
    deleteMessage
}: {
    group: GroupedMessages;
    // eslint-disable-next-line no-unused-vars
    deleteMessage: (messageId: string, threadId: string) => Promise<void>;
}) {
    return (
        <Group align="flex-start" gap="lg" py="xs" wrap="nowrap">
            <UserAvatar
                name={group.author}
                size={'md'}
                fz={'var(--mantine-font-size-sm)'}
                w={avatarSize}
                h={avatarSize}
            />
            <Stack gap={0} w="100%">
                {group.messages.map((message) => (
                    <MessageContent
                        key={message.createDate}
                        message={message}
                        deleteMessage={deleteMessage}
                    />
                ))}
            </Stack>
        </Group>
    );
}
