import { useNotification } from '@/shared/hooks/useNotification';
import { useThreadContext } from '@chat';
import { Badge, BadgeProps, Loader } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { IconDownload, IconFile, IconX } from '@tabler/icons-react';
import { useState, useCallback } from 'react';
import style from './style.module.css';

const ICON_SIZE = '0.8rem';

export function FileBadge({
    onDelete,
    children,
    fileId
}: { fileId?: string; onDelete?: VoidFunction } & BadgeProps) {
    const { hovered, ref } = useHover();

    const rightSection = onDelete ? (
        <IconX className={style.delete_btn} size={ICON_SIZE} onClick={() => onDelete()} />
    ) : null;
    const client = useThreadContext();
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const { showError } = useNotification();

    const handleDownload = useCallback(async () => {
        try {
            setIsDownloading(true);
            await client.downloadFile(fileId, children as string);
            setIsDownloading(false);
        } catch {
            showError('Wystąpił błąd poczas pobierania pliku');
            setIsDownloading(false);
        }
    }, [fileId, client, children, showError]);

    const leftIcon = isDownloading ? (
        <Loader size={ICON_SIZE} />
    ) : hovered && fileId ? (
        <IconDownload size={ICON_SIZE} />
    ) : (
        <IconFile size={ICON_SIZE} />
    );

    return (
        <Badge
            ref={ref}
            classNames={{
                root: fileId ? style.badge : ' '
            }}
            radius={'sm'}
            variant="outline"
            tt="none"
            fw={500}
            onClick={fileId ? handleDownload : () => {}}
            leftSection={leftIcon}
            rightSection={rightSection}>
            {children}
        </Badge>
    );
}
