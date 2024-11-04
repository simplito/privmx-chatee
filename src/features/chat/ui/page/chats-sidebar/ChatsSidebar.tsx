import { ActionIcon, Group, LoadingOverlay, Stack, Text, Tooltip } from '@mantine/core';
import { useInputState } from '@mantine/hooks';
import { IconChevronLeft, IconPlus, IconSearch } from '@tabler/icons-react';
import { ChatsSidebarElement } from './ChatsSidebarElement';
import { openContextModal } from '@mantine/modals';
import { useTranslations } from 'next-intl';
import { SearchInput } from '@/shared/ui/atoms/search-input/SearchInput';
import { Virtuoso } from 'react-virtuoso';
import { THREADS_PER_PAGE, useThreadList } from '@chat/logic';
import { Chat, ChatWithReadState } from '@chat/logic/chat-system/types';

export function ChatsSidebar({
    navigate,
    toggle
}: {
    navigate: (chat: Chat) => void;
    toggle: VoidFunction;
}) {
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

            <Group gap="sm" wrap="nowrap">
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
                                innerProps: {
                                    navigate
                                }
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
                                getThreadList(nextStartIndex);
                                setStartIndex(nextStartIndex);
                            }
                        }}
                        itemContent={(index, chat) => {
                            return (
                                <ChatsSidebarElement
                                    chat={chat}
                                    navigate={navigate}
                                    key={index}
                                    deleteThread={deleteThread}
                                />
                            );
                        }}
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

function filterThreads(threads: Chat[], query: string) {
    return threads.filter((thread) => {
        // const titleMatch = thread.data.title.toLowerCase().includes(query.toLowerCase());
        const titleMatch = thread.title?.toLowerCase().includes(query.toLowerCase());

        if (titleMatch) {
            return titleMatch;
        }

        const userMatch = thread.users.some((user) =>
            user.toLowerCase().includes(query.toLowerCase())
        );

        return userMatch;
    });
}
