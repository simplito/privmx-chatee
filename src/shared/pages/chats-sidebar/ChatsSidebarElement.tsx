import { toChatInfo } from '@/lib/clients/utils';
import { HoverableElement } from '@/shared/ui/atoms/hoverable-element/HoverableElement';
import { useThreadContext } from '@chat';
import { Stack, Text, Group } from '@mantine/core';

export function ChatsSidebarElement({
    name,
    users,
    onClick,
    id
}: {
    id: string;
    name: string;
    users: string[];
    onClick: Function;
}) {
    const currentThread = useThreadContext();

    return (
        <HoverableElement
            data-active={currentThread.threadId === id}
            p="sm"
            radius={'sm'}
            withBorder
            mb={'xs'}
            onClick={() => onClick()}>
            <Stack gap={4}>
                <Text size="sm">{name ? toChatInfo(name).name : 'Default name'}</Text>
                <Group gap="xs">
                    {users.map((user) => (
                        <Text key={user} c="dimmed" size="sm">
                            {user}
                        </Text>
                    ))}
                </Group>
            </Stack>
        </HoverableElement>
    );
}
