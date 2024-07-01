'use client';

import { AppShell, Group, Overlay } from '@mantine/core';
import { useCallback, useState } from 'react';
import { AuthGuard } from '@/shared/ui/atoms/auth-guard/AuthGuard';
import { Navbar } from '@/shared/pages/navbar/Navbar';
import dayjs from 'dayjs';
import 'dayjs/locale/pl';
import 'dayjs/locale/en';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useLocale } from 'next-intl';
import { Chat, ChatsSidebar } from '@chat/ui';
import { StoreCacheContextProvider, ThreadContextProvider } from '@chat/logic';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

export default function Home() {
    const [currentThreadId, setCurrentThreadId] = useState<string | undefined>(undefined);
    const [currentThreadTitle, setCurrentThreadTitle] = useState<string | undefined>(undefined);
    dayjs.locale(useLocale());
    const [sidebarOpen, { toggle, open }] = useDisclosure(true);

    const handleSetCurrentThreadId = useCallback(
        (newThreadId: string) => {
            if (currentThreadId === newThreadId) return;
            setCurrentThreadId(newThreadId);
        },
        [currentThreadId]
    );
    const isMobile = useMediaQuery(`(max-width: 62em)`);

    const navigate = (id: string, title: string): void => {
        open();
        handleSetCurrentThreadId(id);
        setCurrentThreadTitle(title);
    };
    return (
        <AuthGuard>
            <AppShell
                bg="var(--mantine-color-app-body)"
                styles={{
                    navbar: {
                        paddingBottom: 'var(--mantine-spacing-md)',
                        height: isMobile ? '100svh' : undefined,
                        position: isMobile ? 'fixed' : undefined,
                        width: isMobile ? '80%' : undefined,
                        top: isMobile ? 0 : undefined,
                        left: isMobile ? 0 : undefined,
                        paddingRight: isMobile ? 'md' : 0
                    }
                }}
                header={{ height: 70 }}
                navbar={{
                    width: 400,
                    breakpoint: 'md',
                    collapsed: { desktop: false, mobile: sidebarOpen }
                }}>
                <AppShell.Header
                    styles={{
                        header: {
                            marginBottom: 16,
                            border: 0,
                            backgroundColor: 'var(--mantine-color-app-body)'
                        }
                    }}>
                    <Navbar toggle={toggle} />
                </AppShell.Header>
                {!sidebarOpen && (
                    <Overlay
                        onClick={open}
                        pos={'fixed'}
                        top={0}
                        zIndex={100}
                        opacity={0.6}
                        hiddenFrom="md"
                    />
                )}
                <ThreadContextProvider id={currentThreadId} title={currentThreadTitle}>
                    <StoreCacheContextProvider>
                        <AppShell.Navbar bg="transparent" pl="md" style={{ border: 0 }}>
                            <AppShell.Section
                                h={'calc(100% - (var(--mantine-spacing-md)))'}
                                bg="var(--mantine-color-body)"
                                mt="md"
                                p="lg"
                                style={{
                                    borderRadius: 'var(--mantine-radius-lg)',
                                    boxShadow: 'var(--mantine-shadow-xs)'
                                }}>
                                <ChatsSidebar toggle={toggle} navigate={navigate} />
                            </AppShell.Section>
                        </AppShell.Navbar>

                        <AppShell.Main>
                            <Group p="md" w="100%" align="stretch">
                                <Chat key={currentThreadId} navigate={navigate} />
                            </Group>
                        </AppShell.Main>
                    </StoreCacheContextProvider>
                </ThreadContextProvider>
            </AppShell>
        </AuthGuard>
    );
}
