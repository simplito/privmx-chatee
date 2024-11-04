import { ActionIcon, Box, Group, Menu, Paper, Stack, Text } from '@mantine/core';
import { useClickOutside, useHover } from '@mantine/hooks';
import styles from './styles.module.css';
import { IconDots, IconPointFilled, IconTrash } from '@tabler/icons-react';
import { MouseEventHandler, useCallback, useMemo, useState } from 'react';
import { modals } from '@mantine/modals';
import { useTranslations } from 'next-intl';
import { useUserContext } from '@/shared/ui/context/UserContext';
import { useNotification } from '@/shared/hooks/useNotification';
import { useThreadContext } from '@chat/logic';
import { Chat, ChatWithReadState } from '@chat/logic/chat-system/types';

export function ChatsSidebarElement({
    chat,
    navigate,
    deleteThread
}: {
    chat: Chat;
    navigate: (chat: Chat | null) => void;
    deleteThread: (threadId: string) => Promise<void>;
}) {
    const { hovered, ref } = useHover();
    const threadClient = useThreadContext();
    const [opened, setOpened] = useState<boolean>(false);
    const t = useTranslations();
    const { state } = useUserContext();
    const { showError } = useNotification();

    const menuRef = useClickOutside(() => setOpened(false), ['click']);

    const handleActionIconClick: MouseEventHandler<HTMLButtonElement> = useCallback((event) => {
        event.stopPropagation();
        setOpened((opened) => !opened);
    }, []);

    const threadName = chat.title;

    const openDeleteModal: MouseEventHandler<HTMLButtonElement> = useCallback(
        (e) => {
            e.stopPropagation();
            modals.openConfirmModal({
                title: t('chat.sidebar.deleteThread'),
                centered: true,
                children: (
                    <Text size="sm">
                        {t('chat.sidebar.deleteThreadQuestion', { name: threadName })}
                    </Text>
                ),
                labels: { confirm: t('chat.sidebar.deleteThread'), cancel: t('common.cancel') },
                confirmProps: { color: 'red' },
                onConfirm: async () => {
                    try {
                        await deleteThread(chat.chatId);
                        if (threadClient.title === threadName) {
                            navigate(null);
                        }
                    } catch {
                        showError(t('chat.sidebar.deleteThreadError'));
                    }
                }
            });
        },

        [chat.chatId, navigate, t, threadName, threadClient?.title, deleteThread, showError]
    );

    const hasDeleteAccess = useMemo(
        () => chat.managers.includes(state.username) || chat.creator === state.username,
        [chat.creator, state.username, chat.managers]
    );

    const handleOnClick = useCallback(() => {
        navigate(chat);
    }, [navigate, chat]);

    return (
        <Paper
            ref={ref}
            className={`${styles.hoverable}`}
            data-active={threadClient?.chatId === chat.chatId}
            p="sm"
            radius={'sm'}
            withBorder
            mb={'xs'}
            onClick={() => handleOnClick()}>
            <Group w="100%" justify="space-between" h="100%" align="flex-start">
                <Stack gap={4} w="85%">
                    <Group gap={4}>
                        <Text size="sm" style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {chat.title}
                        </Text>
                    </Group>
                    <Group gap="xs">
                        {chat.users.map((user) => (
                            <Text key={user} className="dimmed" size="sm">
                                {user}
                            </Text>
                        ))}
                    </Group>
                </Stack>

                {hasDeleteAccess && (
                    <Box ref={menuRef}>
                        <Menu
                            position="bottom-end"
                            opened={opened}
                            onClose={() => setOpened(false)}
                            closeOnClickOutside
                            closeOnEscape>
                            {(hovered || opened) && (
                                <Menu.Target>
                                    <ActionIcon
                                        size={16}
                                        variant="subtle"
                                        onClick={handleActionIconClick}>
                                        <IconDots />
                                    </ActionIcon>
                                </Menu.Target>
                            )}

                            <Menu.Dropdown>
                                <Menu.Item
                                    color="red"
                                    leftSection={<IconTrash size={16} />}
                                    onClick={(e) => {
                                        openDeleteModal(e);
                                    }}>
                                    <Text size="xs">Usuń wątek</Text>
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Box>
                )}
            </Group>
        </Paper>
    );
}
