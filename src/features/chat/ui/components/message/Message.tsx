import { Text, Avatar, Group, Paper, Stack, Skeleton } from '@mantine/core';
import { FileBadge } from '../file-badge';
import { ChatMessage } from '@chat/logic';

type Props =
    | {
          loading?: false;
          message: ChatMessage;
      }
    | {
          loading: true;
          message?: ChatMessage;
      };
const avatarSize = 'calc(2 * 1em * var(--mantine-line-height-sm))';

export function Message({ loading = false, message }: Props) {
    if (loading) {
        return (
            <Group align="flex-start" opacity={0.8} py="xs">
                <Avatar
                    size={'md'}
                    fz={'var(--mantine-font-size-sm)'}
                    w={avatarSize}
                    h={avatarSize}
                />
                <Stack gap={0} flex={1}>
                    <Skeleton width="100px" opacity={0.5}>
                        <Text c="dimmed" size="sm">
                            Lorem ipsum
                        </Text>
                    </Skeleton>
                    <Paper radius={'sm'} w="80%" pr="sm" h="45%" mt={1}>
                        <Skeleton w="auto" opacity={0.5}>
                            <Text size="sm" opacity={0.98} lineClamp={1}>
                                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Facilis
                                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                            </Text>
                        </Skeleton>
                    </Paper>
                </Stack>
            </Group>
        );
    }

    if (message.status === 'pending') {
        return (
            <Group align="flex-start" opacity={0.8} py="xs">
                <Avatar size={'md'} />
                <Stack gap={0}>
                    <Text c="dimmed" size="sm">
                        {message.author}
                    </Text>
                    <Paper radius={'sm'} maw={800}>
                        {message.mimetype === 'text' ? (
                            <Text size="sm" opacity={0.98}>
                                {message.text}
                            </Text>
                        ) : (
                            <FileBadge opacity={0.8} fileName={message.fileName} />
                        )}
                    </Paper>
                </Stack>
            </Group>
        );
    }

    switch (message.mimetype) {
        case 'text':
            return (
                <Group align="flex-start" py="xs">
                    <Avatar size={'md'} />
                    <Stack gap={0}>
                        <Text size="sm">{message.author}</Text>
                        <Paper radius={'sm'} maw={800}>
                            <Text size="sm" opacity={0.9}>
                                {message.text}
                            </Text>
                        </Paper>
                    </Stack>
                </Group>
            );
        case 'file':
            return (
                <Group align="flex-start" py="xs">
                    <Avatar size={'md'} />
                    <Stack gap={0}>
                        <Text size="sm">{message.author}</Text>
                        <Paper radius={'sm'} maw={800}>
                            <FileBadge fileId={message.fileId} fileName={message.fileName} />
                        </Paper>
                    </Stack>
                </Group>
            );
    }
}
