import { useUserContext } from '@/shared/ui/context/UserContext';
import { Menu } from '@mantine/core';
import { IconLogout, IconWorld } from '@tabler/icons-react';
import styles from './styles.module.css';
import { UserAvatar } from '@/shared/ui/atoms/user-avatar/UserAvatar';
import { EndpointEventManager } from '@/lib/endpoint-api/types/events';
import { useTranslations } from 'next-intl';
export function HeaderMenu() {
    const {
        state: { username }
    } = useUserContext();
    const t = useTranslations();
    const dispatchLogoutEvent = () => {
        EndpointEventManager.dispatchEvent({
            type: 'libPlatformDisconnected'
        });
    };

    function changeNextLocaleCookieValue() {
        const cookieVal = getLocalCookieVal();
        const newValue = cookieVal == 'pl' ? 'en' : 'pl';

        document.cookie = `NEXT_LOCALE=${newValue}; path=/; max-age=31536000; SameSite=Lax`;
        dispatchLogoutEvent();
    }

    return (
        <Menu shadow="md" width={200} position="bottom-end" offset={12}>
            <Menu.Target>
                <UserAvatar className={styles.avatar} name={username} />
            </Menu.Target>

            <Menu.Dropdown ml={'xs'}>
                <Menu.Item
                    leftSection={<IconWorld size={'1rem'} />}
                    onClick={changeNextLocaleCookieValue}>
                    {getLocalCookieVal() == 'pl' ? 'Switch to English' : 'Przełącz na język polski'}
                </Menu.Item>
                <Menu.Item leftSection={<IconLogout size={'1rem'} />} onClick={dispatchLogoutEvent}>
                    {t('chat.navbar.menu.signOut')}
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}

export function getLocalCookieVal() {
    if (!document) {
        return '';
    }

    const name = encodeURIComponent('NEXT_LOCALE') + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1); // Trim leading whitespace
        if (c.indexOf(name) === 0) return c.substring(name.length, c.length); // If the cookie is found, return its value
    }
    return '';
}
