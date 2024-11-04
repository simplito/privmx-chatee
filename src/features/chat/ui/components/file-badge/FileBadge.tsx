import { useNotification } from '@/shared/hooks/useNotification';
import { Badge, BadgeProps, Loader } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { IconDownload, IconFile, IconX } from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import style from './style.module.css';
import { useMessagesSystem } from '@srs/ReactBindings';
import { useTranslations } from 'next-intl';

const ICON_SIZE = '0.8rem';

export function FileBadge({
    onDelete,
    fileId,
    fileName
}: { fileId?: string; fileName: string; onDelete?: VoidFunction } & BadgeProps) {
    const { hovered, ref } = useHover();

    const rightSection = onDelete ? (
        <IconX className={style.delete_btn} size={ICON_SIZE} onClick={() => onDelete()} />
    ) : null;
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const { showError, showSuccess } = useNotification();

    const t = useTranslations();

    const messageSystem = useMessagesSystem();

    const handleDownload = useCallback(async () => {
        try {
            setIsDownloading(true);
            await messageSystem.downloadAttachment({ attachmentId: fileId, name: fileName });
            showSuccess(t('chat.chatFiles.fileDownloadSuccess'));
            setIsDownloading(false);
        } catch {
            showError(t('chat.chatFiles.error.errorDuringFileDownload'));
            setIsDownloading(false);
        }
    }, [fileName, fileId, messageSystem, showError, t, showSuccess]);

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
            {fileName}
        </Badge>
    );
}
