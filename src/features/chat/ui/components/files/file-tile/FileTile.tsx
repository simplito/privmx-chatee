import { ActionIcon, Group, Loader, Paper, Text, ThemeIcon } from '@mantine/core';
import { IconDownload, IconFile } from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import { useNotification } from '@/shared/hooks/useNotification';
import { useMessagesSystem } from '@srs/ReactBindings';
import { ChatAttachment } from '@chat/logic/messages-system/types';
import { useTranslations } from 'next-intl';

export function FileTile({ file }: { file: ChatAttachment }) {
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
            showError('Wystąpił błąd poczas pobierania pliku');
            setIsDownloading(false);
        }
    }, [file, showSuccess, t, showError, messageSystem]);

    return (
        <Paper p="sm" withBorder miw={300} radius={'md'}>
            <Group gap="xs">
                <ThemeIcon size="xs" variant="transparent">
                    <IconFile size={16} />
                </ThemeIcon>
                <Text size="md">{file.name}</Text>
                <ActionIcon size={'sm'} variant="subtle" ml="auto" onClick={() => handleDownload()}>
                    {isDownloading ? <Loader size={16} /> : <IconDownload size={16} />}
                </ActionIcon>
            </Group>
        </Paper>
    );
}
