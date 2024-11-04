'use client';
import {
    Box,
    Button,
    Center,
    Group,
    Pagination,
    rem,
    ScrollArea,
    SegmentedControl,
    Table,
    TextInput
} from '@mantine/core';
import { IconArticle, IconExclamationCircle, IconSearch, IconTable } from '@tabler/icons-react';
import { useState } from 'react';
import { useInputState } from '@mantine/hooks';
import { Blankslate } from '@/shared/ui/atoms/blankslate/Blankslate';
import { LoadingState } from '@/shared/ui/atoms/loading-state/LoadingState';
import { useTranslations } from 'next-intl';
import { FileTableRow, FileTile } from '..';
import { useFilesList } from '@chat/logic';

export function ChatFiles() {
    const { files, status, total, activePage, goToPage, loadFiles } = useFilesList();
    const [chatsQuery, changeChatsQuerry] = useInputState('');
    const t = useTranslations();

    const [viewType, setViewType] = useState<'TABLE' | 'LIST'>('TABLE');

    if (status === 'loading') {
        return <LoadingState title={t('chat.chatFiles.loadingFiles')} />;
    }

    if (status === 'error') {
        return (
            <Blankslate
                icon={<IconExclamationCircle size={32} />}
                primaryAction={
                    <Button
                        onClick={() => {
                            loadFiles();
                        }}>
                        Spróbuj ponownie
                    </Button>
                }
                title={t('chat.chatFiles.error.errorTitle')}
                subTitle={t('chat.chatFiles.error.errorSubtitle')}
            />
        );
    }

    return (
        <Box
            flex={1}
            h="calc(100% - 90px)"
            p="lg"
            display={'flex'}
            style={{ flexDirection: 'column' }}>
            <Group mb="md">
                <Group gap="xs" maw={500}>
                    <TextInput
                        flex={1}
                        w="auto"
                        onChange={changeChatsQuerry}
                        value={chatsQuery}
                        leftSection={<IconSearch size={16} />}
                        placeholder={t('common.search')}
                        size="xs"
                    />
                    <SegmentedControl
                        size="xs"
                        value={viewType}
                        onChange={(e: any) => setViewType(e)}
                        data={[
                            {
                                value: 'TABLE',
                                label: (
                                    <Center style={{ gap: 10 }}>
                                        <IconTable style={{ width: rem(16), height: rem(16) }} />
                                    </Center>
                                )
                            },
                            {
                                value: 'LIST',
                                label: (
                                    <Center style={{ gap: 10 }}>
                                        <IconArticle style={{ width: rem(16), height: rem(16) }} />
                                    </Center>
                                )
                            }
                        ]}
                    />
                </Group>

                <Pagination
                    total={total}
                    value={activePage}
                    onChange={goToPage}
                    size={'sm'}
                    ml="auto"
                />
            </Group>
            <ScrollArea style={{ flexGrow: 1 }}>
                {viewType === 'LIST' ? (
                    <Group pos="relative" gap={'md'}>
                        {files.map((file) => (
                            <FileTile key={file.attachmentId} file={file} />
                        ))}
                    </Group>
                ) : (
                    <Table stickyHeader striped withRowBorders={false}>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th colSpan={2}>{t('chat.chatFiles.name')}</Table.Th>
                                <Table.Th colSpan={2}>{t('chat.chatFiles.author')}</Table.Th>
                                <Table.Th colSpan={2} visibleFrom="lg">
                                    {t('chat.chatFiles.size')}
                                </Table.Th>
                                <Table.Th visibleFrom="md" colSpan={2}>
                                    {t('chat.chatFiles.creationDate')}
                                </Table.Th>
                                <Table.Th colSpan={1}></Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {files.map((element) => (
                                <FileTableRow key={element.attachmentId} file={element} />
                            ))}
                        </Table.Tbody>
                    </Table>
                )}
            </ScrollArea>
        </Box>
    );
}
