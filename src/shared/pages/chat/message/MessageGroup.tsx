import { Group, Stack } from '@mantine/core';
import { MessageContent } from './MessageContent';
import { GroupedMessages } from './groupMessages';
import { UserAvatar } from '@/shared/ui/atoms/user-avatar/UserAvatar';

const avatarSize = 'calc(2 * 1em * var(--mantine-line-height-sm))';

export function MessageGroup({ group }: { group: GroupedMessages }) {
    return (
        <Group align="flex-start" py="xs" gap="lg">
            <UserAvatar
                name={group.author}
                size={'md'}
                fz={'var(--mantine-font-size-sm)'}
                w={avatarSize}
                h={avatarSize}
            />
            <Stack gap={8}>
                {group.messages.map((message) => (
                    <MessageContent key={message.createDate} message={message} />
                ))}
            </Stack>
        </Group>
    );
}
