import { toChatInfo } from '@/lib/clients/utils';
import { useThreadContext } from '@chat';
import { Stack, Text, Group, Paper, ActionIcon, Menu, Box } from '@mantine/core';
import { useClickOutside, useHover } from '@mantine/hooks';
import styles from './styles.module.css';
import { IconDots, IconTrash } from '@tabler/icons-react';
import { MouseEventHandler, useCallback, useMemo, useState } from 'react';
import { modals } from '@mantine/modals';
import { useTranslations } from 'next-intl';
import { useUserContext } from '@/shared/ui/context/UserContext';
import { useNotification } from '@/shared/hooks/useNotification';

export function ChatsSidebarElement({
    name,
    users,
    navigate,
    id,
    deleteThread,
    managers,
    creator
}: {
    id: string;
    name: string;
    users: string[];
    // eslint-disable-next-line no-unused-vars
    navigate: (threadId: string | undefined, threadTitle: string) => void;
    // eslint-disable-next-line no-unused-vars
    deleteThread: (threadId: string) => Promise<void>;
    managers: string[];
    creator: string;
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

    const { name: threadName } = toChatInfo(name);

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
                        await deleteThread(id);
                        if (threadClient.chatInfo.name === threadName) {
                            navigate(undefined, '');
                        }
                    } catch {
                        showError(t('chat.sidebar.deleteThreadError'));
                    }
                }
            });
        },

        [id, navigate, t, threadName, threadClient.chatInfo.name, deleteThread, showError]
    );

    const hasDeleteAccess = useMemo(
        () => managers.includes(state.username) || creator === state.username,
        [creator, managers, state.username]
    );

    return (
        <Paper
            ref={ref}
            className={`${styles.hoverable}`}
            data-active={threadClient.threadId === id}
            p="sm"
            radius={'sm'}
            withBorder
            mb={'xs'}
            onClick={() => navigate(id, name)}>
            <Group w="100%" justify="space-between" h="100%" align="flex-start">
                <Stack gap={4} w="85%">
                    <Text size="sm">{name ? toChatInfo(name).name : 'Default name'}</Text>
                    <Group gap="xs">
                        {users.map((user) => (
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
