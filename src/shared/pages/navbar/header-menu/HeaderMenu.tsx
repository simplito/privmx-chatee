import { useUserContext } from '@/shared/ui/context/UserContext';
import { Menu } from '@mantine/core';
import { IconLogout, IconWorld } from '@tabler/icons-react';
import styles from './styles.module.css';
import { UserAvatar } from '@/shared/ui/atoms/user-avatar/UserAvatar';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';
import { useLocale } from '@/shared/hooks/useLocaleDate';

export function HeaderMenu({
    onLogOut,
    children
}: {
    children?: ReactNode;
    onLogOut: VoidFunction;
}) {
    const {
        state: { username }
    } = useUserContext();
    const t = useTranslations();

    const locale = useLocale();

    async function changeNextLocaleCookieValue() {
        const cookieVal = locale;
        const newValue = cookieVal == 'pl' ? 'en' : 'pl';

        document.cookie = `NEXT_LOCALE=${newValue}; path=/; max-age=31536000; SameSite=Lax`;
        await onLogOut();
    }

    return (
        <Menu shadow="md" width={200} position="bottom-end" offset={12}>
            <Menu.Target>
                <UserAvatar
                    className={styles.avatar}
                    name={username}
                    tooltipProps={{ disabled: true }}
                />
            </Menu.Target>

            <Menu.Dropdown ml={'xs'}>
                {children}
                <Menu.Item
                    leftSection={<IconWorld size={'1rem'} />}
                    onClick={changeNextLocaleCookieValue}>
                    {locale == 'pl' ? 'Switch to English' : 'Przełącz na język polski'}
                </Menu.Item>
                <Menu.Item leftSection={<IconLogout size={'1rem'} />} onClick={onLogOut}>
                    {t('chat.navbar.menu.signOut')}
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}
