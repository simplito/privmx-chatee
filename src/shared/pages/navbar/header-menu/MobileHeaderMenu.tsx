import { useUserContext } from '@/shared/ui/context/UserContext';
import { Menu } from '@mantine/core';
import { IconLogout, IconWorld } from '@tabler/icons-react';
import styles from './styles.module.css';
import { UserAvatar } from '@/shared/ui/atoms/user-avatar/UserAvatar';
import { EndpointEventManager } from '@privmx/endpoint-web';
import { useTranslations } from 'next-intl';
import { openContextModal } from '@mantine/modals';
import { IconDoamin } from '@icon';
import { getDomainClient } from '@/shared/utils/domain';
export function MobileHeaderMenu() {
    const {
        state: { username, isStaff }
    } = useUserContext();
    const t = useTranslations();
    const dispatchLogoutEvent = () => {
        EndpointEventManager.dispatchEvent({
            type: 'libPlatformDisconnected'
        });
    };
    function getLocalCookieVal() {
        if (!window.document) {
            return '';
        }

        const name = encodeURIComponent('NEXT_LOCALE') + '=';
        const decodedCookie = decodeURIComponent(window.document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1); // Trim leading whitespace
            if (c.indexOf(name) === 0) return c.substring(name.length, c.length); // If the cookie is found, return its value
        }
        return '';
    }

    function changeNextLocaleCookieValue() {
        const cookieVal = getLocalCookieVal();
        const newValue = cookieVal == 'pl' ? 'en' : 'pl';

        document.cookie = `NEXT_LOCALE=${newValue}; path=/; max-age=31536000; SameSite=Lax`;
        dispatchLogoutEvent();
    }
    const currentDomain = getDomainClient();

    return (
        <Menu shadow="md" width={200} position="bottom-end" offset={12}>
            <Menu.Target>
                <UserAvatar hiddenFrom="md" className={styles.avatar} name={username} />
            </Menu.Target>

            <Menu.Dropdown ml={'xs'}>
                <Menu.Item>{username}</Menu.Item>
                {isStaff && (
                    <Menu.Item
                        leftSection={<IconDoamin size="1rem" />}
                        onClick={() => {
                            openContextModal({
                                modal: 'domainModal',
                                innerProps: {
                                    size: 'xl'
                                }
                            });
                        }}>
                        {currentDomain}
                    </Menu.Item>
                )}
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
