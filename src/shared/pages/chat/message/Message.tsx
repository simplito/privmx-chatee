import { Text, Avatar, Group, Paper, Stack, Skeleton } from '@mantine/core';
import { ChatMessage } from '..';
import { FileBadge } from '../file-badge';

type Props =
    | {
          loading?: false;
          message: ChatMessage;
      }
    | {
          loading: true;
          message?: ChatMessage;
      };

export function Message({ loading = false, message }: Props) {
    if (loading) {
        return (
            <Group align="flex-start" opacity={0.8} py="xs">
                <Avatar size={'md'} />
                <Stack gap={4}>
                    <Skeleton width="100px" opacity={0.5}>
                        <Text c="dimmed" size="sm">
                            Lorem ipsum
                        </Text>
                    </Skeleton>
                    <Paper radius={'sm'} maw={800}>
                        <Skeleton w="auto" opacity={0.5}>
                            <Text size="sm" opacity={0.98}>
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
                        {message.text.type === 'text' ? (
                            <Text size="sm" opacity={0.98}>
                                {message.text.content}
                            </Text>
                        ) : (
                            <FileBadge opacity={0.8}>{message.text.fileName}</FileBadge>
                        )}
                    </Paper>
                </Stack>
            </Group>
        );
    }

    switch (message.data.text.type) {
        case 'text':
            return (
                <Group align="flex-start" py="xs">
                    <Avatar size={'md'} />
                    <Stack gap={0}>
                        <Text size="sm">{message.author}</Text>
                        <Paper radius={'sm'} maw={800}>
                            <Text size="sm" opacity={0.9}>
                                {message.data.text.content}
                            </Text>
                        </Paper>
                    </Stack>
                </Group>
            );
        case 'fileupload':
            return (
                <Group align="flex-start" py="xs">
                    <Avatar size={'md'} />
                    <Stack gap={0}>
                        <Text size="sm">{message.author}</Text>
                        <Paper radius={'sm'} maw={800}>
                            <FileBadge fileId={message.data.text.fileId}>
                                {message.data.text.fileName}
                            </FileBadge>
                        </Paper>
                    </Stack>
                </Group>
            );
    }
}
