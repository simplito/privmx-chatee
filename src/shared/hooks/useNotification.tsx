import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
export function useNotification() {
    const id = useRef(0);
    const t = useTranslations();
    const showError = useCallback(
        (content: string) => {
            notifications.show({
                id: `${id.current}`,
                autoClose: 5000,
                title: t('common.somethingWentWrong'),
                message: content,
                icon: <IconAlertCircle />,
                color: 'red',
                styles: {
                    root: {
                        border: 'var(--mantine-border)',
                        borderColor: 'var(--mantine-color-red-3)',
                        background: 'var(--mantine-color-red-0)'
                    }
                }
            });
            id.current++;
        },
        [t]
    );

    const showSuccess = useCallback(
        (content: string) => {
            notifications.show({
                id: `${id.current}`,
                autoClose: 5000,
                title: t('common.success'),
                message: content,
                icon: <IconCheck />,
                color: 'green',
                styles: {
                    root: {
                        border: 'var(--mantine-border)',
                        borderColor: 'var(--mantine-color-green-3)',
                        background: 'var(--mantine-color-green-0)'
                    }
                }
            });
            id.current++;
        },
        [t]
    );

    const showInfo = useCallback(
        (content: string, title?: string) => {
            notifications.show({
                id: `${id.current}`,
                autoClose: 5000,
                title: title || t('common.success'),
                message: content,
                icon: <IconInfoCircle />
            });
            id.current++;
        },
        [t]
    );

    return { showError, showSuccess, showInfo };
}
