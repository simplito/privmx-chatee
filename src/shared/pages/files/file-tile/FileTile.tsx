import { StoreFileInfo } from '@/lib/endpoint-api/types/store';
import { ActionIcon, Group, Loader, Paper, Text, ThemeIcon } from '@mantine/core';
import { IconDownload, IconFile } from '@tabler/icons-react';
import { useThreadContext } from '../../chat/useThreadContext';
import { useCallback, useState } from 'react';
import { useNotification } from '@/shared/hooks/useNotification';

export function FileTile({ file }: { file: StoreFileInfo }) {
    const client = useThreadContext();
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const { showError } = useNotification();

    const handleDownload = useCallback(async () => {
        try {
            setIsDownloading(true);
            await client.downloadFile(file.fileId, file.data.name);
            setIsDownloading(false);
        } catch {
            showError('Wystąpił błąd poczas pobierania pliku');
            setIsDownloading(false);
        }
    }, [file.data.name, client, file.fileId, showError]);

    return (
        <Paper p="sm" withBorder miw={300} radius={'md'}>
            <Group gap="xs">
                <ThemeIcon size="xs" variant="transparent">
                    <IconFile size={16} />
                </ThemeIcon>
                <Text size="md">{file.data.name}</Text>
                <ActionIcon size={'sm'} variant="subtle" ml="auto" onClick={() => handleDownload()}>
                    {isDownloading ? <Loader size={16} /> : <IconDownload size={16} />}
                </ActionIcon>
            </Group>
        </Paper>
    );
}
