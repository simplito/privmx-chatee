'use client';

import { useNotification } from '@/shared/hooks/useNotification';
import { Sheet } from '@/shared/ui/atoms/sheet/Sheet';
import { NEXT_PUBLIC_BACKEND_URL } from '@/shared/utils/env';
import {
    ActionIcon,
    AppShellHeader,
    Box,
    Flex,
    Group,
    MenuItem,
    Space,
    Title
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { HeaderMenu } from '@pages/navbar/header-menu/HeaderMenu';
import { MobileHeaderMenu } from '@pages/navbar/header-menu/MobileHeaderMenu';
import { IconKey, IconMenu2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export function OwnerPanelNavbar() {
    const [, { toggle }] = useDisclosure(true);

    const isMobile = useMediaQuery(`(max-width: 62em)`);

    const { showSuccess } = useNotification();

    const router = useRouter();

    async function handleLogOut() {
        router.push('/owner/sign-in');
        const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/owner/log-out`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({})
        });

        if (response.ok) {
            showSuccess('Log out');
            return;
        }
    }

    const t = useTranslations();

    return (
        <AppShellHeader
            styles={{
                header: {
                    marginBottom: 16,
                    border: 0,
                    backgroundColor: 'var(--mantine-color-app-body)'
                }
            }}>
            <Sheet m="md" radius={'md'} pl="lg" pr="sm" h="calc(100% - 16px)">
                <Flex h="100%" align={'center'}>
                    <Box w="100%" hiddenFrom="md">
                        <ActionIcon variant="subtle" onClick={() => toggle()}>
                            <IconMenu2 size={24} />
                        </ActionIcon>
                    </Box>
                    <Box w="100%">
                        <Title ta={isMobile ? 'center' : 'left'} order={3}>
                            Chatee
                        </Title>
                    </Box>
                    <Box w="100%">
                        <Group justify="flex-end" visibleFrom="md">
                            <Space />
                            <Group gap={'xs'}>
                                <HeaderMenu onLogOut={handleLogOut}>
                                    <MenuItem
                                        leftSection={<IconKey size={16} />}
                                        onClick={() =>
                                            modals.openContextModal({
                                                modal: 'changeOwnerTokenModal',
                                                innerProps: {}
                                            })
                                        }>
                                        {t('owner.navbar.changeOwnerToken')}
                                    </MenuItem>
                                </HeaderMenu>
                            </Group>
                        </Group>
                        <Group justify="flex-end">
                            <MobileHeaderMenu onLogOut={handleLogOut}>
                                <MenuItem
                                    leftSection={<IconKey size={16} />}
                                    onClick={() =>
                                        modals.openContextModal({
                                            modal: 'changeOwnerTokenModal',
                                            innerProps: {}
                                        })
                                    }>
                                    {t('owner.navbar.changeOwnerToken')}
                                </MenuItem>
                            </MobileHeaderMenu>
                        </Group>
                    </Box>
                </Flex>
            </Sheet>
        </AppShellHeader>
    );
}
