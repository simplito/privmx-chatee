import { useUserContext } from '@/shared/ui/context/UserContext';
import { Menu } from '@mantine/core';
import { IconLogout, IconWorld } from '@tabler/icons-react';
import styles from './styles.module.css';
import { UserAvatar } from '@/shared/ui/atoms/user-avatar/UserAvatar';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/shared/hooks/useLocaleDate';
import { ReactNode } from 'react';

export function MobileHeaderMenu({
    children,
    onLogOut
}: {
    onLogOut: VoidFunction;
    children?: ReactNode;
}) {
    const {
        state: { username }
    } = useUserContext();
    const t = useTranslations();
    const locale = useLocale();
    const dispatchLogoutEvent = () => {
        onLogOut();
    };

    function changeNextLocaleCookieValue() {
        const cookieVal = locale;
        const newValue = cookieVal == 'pl' ? 'en' : 'pl';

        document.cookie = `NEXT_LOCALE=${newValue}; path=/; max-age=31536000; SameSite=Lax`;
        dispatchLogoutEvent();
    }

    return (
        <Menu shadow="md" width={200} position="bottom-end" offset={12}>
            <Menu.Target>
                <UserAvatar
                    tooltipProps={{ disabled: true }}
                    hiddenFrom="md"
                    className={styles.avatar}
                    name={username}
                />
            </Menu.Target>

            <Menu.Dropdown ml={'xs'}>
                {username && <Menu.Item>{username}</Menu.Item>}
                {children}
                <Menu.Item
                    leftSection={<IconWorld size={'1rem'} />}
                    onClick={changeNextLocaleCookieValue}>
                    {locale == 'pl' ? 'Switch to English' : 'Przełącz na język polski'}
                </Menu.Item>
                <Menu.Item leftSection={<IconLogout size={'1rem'} />} onClick={dispatchLogoutEvent}>
                    {t('chat.navbar.menu.signOut')}
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}
