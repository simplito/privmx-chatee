import { Text, Stack, Group, Paper, ActionIcon, Popover, Button } from '@mantine/core';
import { ChatMessage } from '..';
import { FileBadge } from '../file-badge';
import styles from './styles.module.css';
import dayjs from 'dayjs';
import { useLocale, useTranslations } from 'next-intl';
import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useUserContext } from '@/shared/ui/context/UserContext';
import { Endpoint } from '@/lib/endpoint-api/endpoint';
import { useNotification } from '@/shared/hooks/useNotification';

export function MessageContent({
    message,
    deleteMessage
}: {
    message: ChatMessage;
    // eslint-disable-next-line no-unused-vars
    deleteMessage: (messageId: string, threadId: string) => Promise<void>;
}) {
    const locale = useLocale();
    const [opened, setOpened] = useState(false);
    const t = useTranslations('chat.chat');
    const { state } = useUserContext();
    const { showError } = useNotification();

    const handleMessageDelete = async () => {
        if (message.status === 'sent') {
            try {
                deleteMessage(message.messageId, message.threadId);
                if (message.data.text.type === 'fileupload') {
                    const endpoint = await Endpoint.getInstance();
                    endpoint.storeFileDelete(message.data.text.fileId);
                }
            } catch {
                showError(t('messageDeleteError'));
            }
        }
    };

    if (message.status === 'pending') {
        return (
            <Stack gap={0} className={styles.group_message}>
                <Group className={styles.message_author}>
                    <Text c="dimmed" size="sm">
                        {message.author}
                    </Text>
                    <Text c="dimmed" size="xs" fw={400}>
                        {dayjs(message.createDate).locale(locale).fromNow()}
                    </Text>
                </Group>

                <Paper radius={'sm'} maw={800} className={styles.message}>
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

    return (
        <Stack gap={0} className={styles.group_message}>
            <Group className={styles.message_author}>
                <Text fw={600} size="sm">
                    {message.author}
                </Text>
                <Text c="dimmed" size="xs" fw={400}>
                    {dayjs(message.createDate).locale(locale).fromNow()}
                </Text>
            </Group>
            <Paper radius={'sm'}>
                <Popover position="bottom-end" withArrow opened={opened} onChange={setOpened}>
                    <Popover.Target>
                        <Group
                            w="100%"
                            align="center"
                            justify="space-between"
                            className={styles.message}>
                            {message.data.text.type === 'text' && (
                                <Text size="sm" opacity={0.9}>
                                    {message.data.text.content}
                                </Text>
                            )}

                            {message.data.text.type === 'fileupload' && (
                                <FileBadge fileId={message.data.text.fileId}>
                                    {message.data.text.fileName}
                                </FileBadge>
                            )}
                            {(state.username === message.author || state.isStaff) && (
                                <ActionIcon
                                    onClick={() => setOpened(true)}
                                    size="xs"
                                    color="red"
                                    variant="subtle"
                                    className={styles.trashcan}>
                                    <IconTrash width={22} height={22} />
                                </ActionIcon>
                            )}
                        </Group>
                    </Popover.Target>
                    <Popover.Dropdown
                        style={{
                            border: 'var(--mantine-border)',
                            boxShadow: 'var(--mantine-shadow-sm)'
                        }}>
                        <Stack gap="xs">
                            <Text size="sm">{t('deleteMessage')}</Text>
                            <Group justify="flex-end">
                                <Button
                                    size="xs"
                                    color="red"
                                    onClick={async () => handleMessageDelete()}>
                                    {t('delete')}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setOpened(false);
                                    }}
                                    size="xs"
                                    variant="light">
                                    {t('cancel')}
                                </Button>
                            </Group>
                        </Stack>
                    </Popover.Dropdown>
                </Popover>
            </Paper>
        </Stack>
    );
}
