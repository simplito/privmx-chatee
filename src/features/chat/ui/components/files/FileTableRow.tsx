'use client';
import { Group, Text, ActionIcon, Table, Flex, Loader } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import { StoreFileInfo } from '@simplito/privmx-endpoint-web-sdk';
import { useNotification } from '@/shared/hooks/useNotification';
import { useTranslations } from 'next-intl';
import { UserAvatar } from '@/shared/ui/atoms/user-avatar/UserAvatar';
import { displayDate } from '@/shared/utils/date';
import { useThreadContext } from '@chat/logic';
import { bytesSize } from '@utils/units';

export function FileTableRow({ file }: { file: StoreFileInfo }) {
    const client = useThreadContext();
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const { showError } = useNotification();
    const t = useTranslations();

    const handleDownload = useCallback(async () => {
        try {
            setIsDownloading(true);
            await client.downloadFile(file.fileId);
            setIsDownloading(false);
        } catch {
            showError(t('chat.chatFiles.error.errorDuringFileDownload'));
            setIsDownloading(false);
        }
    }, [client, file.fileId, showError, t]);

    return (
        <Table.Tr key={file.data.name}>
            <Table.Td colSpan={2}>
                <Text c="dimmed" size="sm" lineClamp={1}>
                    {file.data.name}
                </Text>
            </Table.Td>
            <Table.Td colSpan={2}>
                <Group gap={'xs'}>
                    <UserAvatar name={file.author} size={'sm'} />
                    <Text visibleFrom="lg" c="dimmed" size="sm" lineClamp={1}>
                        {file.author}
                    </Text>
                </Group>
            </Table.Td>
            <Table.Td colSpan={2} visibleFrom="lg">
                <Text c="dimmed" size="sm">
                    {bytesSize(file.size)}
                </Text>
            </Table.Td>
            <Table.Td colSpan={2} visibleFrom="md">
                <Text c="dimmed" size="sm">
                    {displayDate(file.createDate)}
                </Text>
            </Table.Td>
            <Table.Td colSpan={1}>
                <Flex w="100%">
                    <ActionIcon
                        size={'sm'}
                        variant="subtle"
                        ml="auto"
                        onClick={() => handleDownload()}>
                        {isDownloading ? <Loader size={16} /> : <IconDownload size={16} />}
                    </ActionIcon>
                </Flex>
            </Table.Td>
        </Table.Tr>
    );
}
