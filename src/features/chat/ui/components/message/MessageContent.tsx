import { ActionIcon, Button, Group, Paper, Popover, Stack, Text } from '@mantine/core';
import { FileBadge } from '../file-badge';
import styles from './styles.module.css';
import dayjs from 'dayjs';
import { useLocale, useTranslations } from 'next-intl';
import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useUserContext } from '@/shared/ui/context/UserContext';
import { useNotification } from '@/shared/hooks/useNotification';
import { ChatMessage } from '@chat/logic/messages-system/types';
import { EndpointConnectionManager } from '@lib/endpoint-api/endpoint';

export function MessageContent({
    message,
    deleteMessage
}: {
    message: ChatMessage;
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
                deleteMessage(message.messageId, message.chatId);
                if (message.mimetype === 'file') {
                    const storeApi = await EndpointConnectionManager.getInstance().getStoreApi();
                    storeApi.deleteFile(message.fileId);
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
                        {dayjs(message.sentDate).locale(locale).fromNow()}
                    </Text>
                </Group>

                <Paper radius={'sm'} w="100%" className={styles.message}>
                    {message.mimetype === 'text' ? (
                        <Text size="sm" opacity={0.9} c="dimmed" w="90%">
                            {message.text}
                        </Text>
                    ) : (
                        <FileBadge opacity={0.8} fileName={message.fileName} />
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
                    {dayjs(message.sentDate).locale(locale).fromNow()}
                </Text>
            </Group>
            <Paper radius={'sm'}>
                <Popover position="bottom-end" withArrow opened={opened} onChange={setOpened}>
                    <Group
                        mod={{ open: opened }}
                        w="100%"
                        align="center"
                        justify="space-between"
                        className={styles.message}>
                        {message.mimetype === 'text' && (
                            <Text size="sm" opacity={0.9} w="90%">
                                {message.text}
                            </Text>
                        )}

                        {message.mimetype === 'file' && (
                            <FileBadge fileId={message.fileId} fileName={message.fileName} />
                        )}
                        {(state.username === message.author || state.isStaff) && (
                            <Popover.Target>
                                <ActionIcon
                                    onClick={() => setOpened(true)}
                                    size="xs"
                                    color="red"
                                    variant="subtle"
                                    className={styles.trashcan}>
                                    <IconTrash width={22} height={22} />
                                </ActionIcon>
                            </Popover.Target>
                        )}
                    </Group>
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
