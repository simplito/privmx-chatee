'use client';
import { ActionIcon, Flex, Group, Loader, Table, Text } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import { useNotification } from '@/shared/hooks/useNotification';
import { useTranslations } from 'next-intl';
import { UserAvatar } from '@/shared/ui/atoms/user-avatar/UserAvatar';
import { displayDate } from '@/shared/utils/date';
import { bytesSize } from '@utils/units';
import { useMessagesSystem } from '@srs/ReactBindings';
import { ChatAttachment } from '@chat/logic';

export function FileTableRow({ file }: { file: ChatAttachment }) {
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const { showError, showSuccess } = useNotification();
    const t = useTranslations();

    const messageSystem = useMessagesSystem();

    const handleDownload = useCallback(async () => {
        try {
            setIsDownloading(true);
            await messageSystem.downloadAttachment(file);
            showSuccess(t('chat.chatFiles.fileDownloadSuccess'));

            setIsDownloading(false);
        } catch (e) {
            console.error(e);
            showError(t('chat.chatFiles.error.errorDuringFileDownload'));
            setIsDownloading(false);
        }
    }, [messageSystem, showError, t, file, showSuccess]);

    return (
        <Table.Tr key={file.name}>
            <Table.Td colSpan={2}>
                <Text c="dimmed" size="sm" lineClamp={1}>
                    {file.name}
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
                    {displayDate(file.sendDate)}
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
