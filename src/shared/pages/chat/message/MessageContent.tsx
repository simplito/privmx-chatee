import { Text, Stack, Group, Paper } from '@mantine/core';
import { ChatMessage } from '..';
import { FileBadge } from '../file-badge';
import styles from './styles.module.css';
import dayjs from 'dayjs';

export function MessageContent({ message }: { message: ChatMessage }) {
    if (message.status === 'pending') {
        return (
            <Stack gap={0} className={styles.group_message}>
                <Group className={styles.message_author}>
                    <Text c="dimmed" size="sm">
                        {message.author}
                    </Text>
                    <Text c="dimmed" size="xs" fw={400}>
                        {dayjs(message.createDate).fromNow()}
                    </Text>
                </Group>

                <Paper radius={'sm'} maw={800}>
                    {message.text.type === 'text' ? (
                        <Text size="sm" opacity={0.9} c="dimmed">
                            {message.text.content}
                        </Text>
                    ) : (
                        <FileBadge opacity={0.8}>{message.text.fileName}</FileBadge>
                    )}
                </Paper>
            </Stack>
        );
    }

    switch (message.data.text.type) {
        case 'text':
            return (
                <Stack gap={0} className={styles.group_message}>
                    <Group className={styles.message_author}>
                        <Text fw={600} size="sm">
                            {message.author}
                        </Text>
                        <Text c="dimmed" size="xs" fw={400}>
                            {dayjs(message.createDate).fromNow()}
                        </Text>
                    </Group>
                    <Paper radius={'sm'} maw={800}>
                        <Text size="sm" opacity={0.9}>
                            {message.data.text.content}
                        </Text>
                    </Paper>
                </Stack>
            );
        case 'fileupload':
            return (
                <Stack gap={0} className={styles.group_message}>
                    <Group className={styles.message_author}>
                        <Text fw={600} size="sm">
                            {message.author}
                        </Text>
                        <Text c="dimmed" fw={400} size="xs">
                            {dayjs(message.createDate).fromNow()}
                        </Text>
                    </Group>
                    <Paper radius={'sm'} maw={800}>
                        <FileBadge fileId={message.data.text.fileId}>
                            {message.data.text.fileName}
                        </FileBadge>
                    </Paper>
                </Stack>
            );
    }
}
