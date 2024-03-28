import { Stack, Group, ActionIcon, Text, LoadingOverlay, Tooltip } from '@mantine/core';
import { useInputState } from '@mantine/hooks';
import { IconSearch, IconPlus, IconChevronLeft } from '@tabler/icons-react';
import { ChatsSidebarElement } from './ChatsSidebarElement';
import { openContextModal } from '@mantine/modals';
import useThreadList, { THREADS_PER_PAGE } from '@/lib/hooks/useThreadList';
import { ThreadInfo } from '@/lib/endpoint-api/types/thread';
import { useTranslations } from 'next-intl';
import { SearchInput } from '@/shared/ui/atoms/search-input/SearchInput';
import { Virtuoso } from 'react-virtuoso';
import { useUserContext } from '@/shared/ui/context/UserContext';

export function ChatsSidebar({
    navigate,
    toggle
}: {
    // eslint-disable-next-line no-unused-vars
    navigate: (threadId: string | undefined, threadTitle: string) => void;
    toggle: VoidFunction;
}) {
    const {
        state: { contextId }
    } = useUserContext();
    const [chatsQuery, changeChatsQuerry] = useInputState('');

    const { threads, status, startIndex, setStartIndex, getThreadList, hasMore, deleteThread } =
        useThreadList(navigate);
    const t = useTranslations();

    return (
        <Stack gap={'sm'} h={'100%'} pos="relative">
            <Group gap={'xs'} mb="sm" h={34} justify="space-between">
                <Text size="lg">{t('chat.sidebar.header')}</Text>
                <ActionIcon hiddenFrom="md" onClick={toggle} variant="light">
                    <IconChevronLeft />
                </ActionIcon>
            </Group>

            <Group gap="sm">
                <SearchInput
                    onChange={changeChatsQuerry}
                    value={chatsQuery}
                    leftSection={<IconSearch size={16} />}
                    placeholder={t('common.search')}
                    size="xs"
                    style={{ flexGrow: 1, boxShadow: 'var(--mantine-shadow-xs)' }}
                />
                <Tooltip label={t('chat.sidebar.newChatTooltip')}>
                    <ActionIcon
                        onClick={() => {
                            toggle();
                            openContextModal({
                                modal: 'createChat',
                                innerProps: {}
                            });
                        }}
                        style={{ boxShadow: 'var(--mantine-shadow-xs)' }}>
                        <IconPlus size={16} />
                    </ActionIcon>
                </Tooltip>
            </Group>
            <Stack gap={'sm'} flex={1} h="100%">
                <LoadingOverlay visible={status === 'loading'} />
                {status === 'success' && threads.length === 0 && (
                    <Text c="dimmed" ta="center" m={'md'}>
                        {t('chat.sidebar.noChats')}
                    </Text>
                )}

                {status === 'success' && threads.length > 0 && (
                    <Virtuoso
                        data={filterThreads(threads, chatsQuery)}
                        endReached={() => {
                            if (hasMore) {
                                const nextStartIndex = startIndex + THREADS_PER_PAGE;
                                getThreadList(contextId, nextStartIndex);
                                setStartIndex(nextStartIndex);
                            }
                        }}
                        itemContent={(index, chat) => (
                            <ChatsSidebarElement
                                id={chat.threadId}
                                navigate={navigate}
                                key={index}
                                name={chat.data.title}
                                users={chat.users}
                                deleteThread={deleteThread}
                                managers={chat.managers}
                                creator={chat.creator}
                            />
                        )}
                        style={{
                            // overscrollBehavior: 'contain',
                            display: 'flex',
                            padding: 'var(--mantine-spacing-md) 0'
                        }}
                    />
                )}
            </Stack>
        </Stack>
    );
}

function filterThreads(threads: ThreadInfo[], query: string) {
    return threads.filter((thread) => {
        const titleMatch = thread.data.title.toLowerCase().includes(query.toLowerCase());

        if (titleMatch) {
            return titleMatch;
        }

        const userMatch = thread.users.some((user) =>
            user.toLowerCase().includes(query.toLowerCase())
        );

        return userMatch;
    });
}
