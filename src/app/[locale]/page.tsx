'use client';

import { AppShell, Group } from '@mantine/core';
import { useCallback, useState } from 'react';
import { Chat, ThreadContextProvider } from '@chat';
import { ChatsSidebar } from '@/shared/pages/chats-sidebar/ChatsSidebar';
import { AuthGuard } from '@/shared/ui/atoms/auth-guard/AuthGuard';
import { Navbar } from '@/shared/pages/navbar/Navbar';
import dayjs from 'dayjs';
import 'dayjs/locale/pl';
import 'dayjs/locale/en';
import relativeTime from 'dayjs/plugin/relativeTime';
import { StoreCacheContextProvider } from '@/shared/ui/context/StoreCacheContext';
import { getLocalCookieVal } from '@/shared/pages/navbar/header-menu/HeaderMenu';

dayjs.extend(relativeTime);

export default function Home() {
    dayjs.locale(getLocalCookieVal());

    const [currentThreadId, setCurrentThreadId] = useState<string | undefined>(undefined);
    const [currentThreadTitle, setCurrentThreadTitle] = useState<string | undefined>(undefined);

    const handleSetCurrentThreadId = useCallback(
        (newThreadId: string) => {
            if (currentThreadId === newThreadId) return;
            setCurrentThreadId(newThreadId);
        },
        [currentThreadId]
    );

    return (
        <AuthGuard>
            <AppShell
                bg="var(--mantine-color-app-body)"
                styles={{
                    navbar: {
                        padding: 'var(--mantine-spacing-md)',
                        paddingTop: 0,
                        marginTop: 'var(--mantine-spacing-md)',
                        bottom: 'var(--mantine-spacing-md)'
                    }
                }}
                header={{ height: 70 }}
                navbar={{ width: 400, breakpoint: 'sm' }}>
                <AppShell.Header
                    styles={{
                        header: {
                            marginBottom: 16,
                            border: 0,
                            backgroundColor: 'var(--mantine-color-app-body)'
                        }
                    }}>
                    <Navbar />
                </AppShell.Header>
                <ThreadContextProvider id={currentThreadId} title={currentThreadTitle}>
                    <StoreCacheContextProvider>
                        <AppShell.Navbar
                            bg="var(--mantine-color-app-body)"
                            pr="0"
                            style={{ border: 0 }}>
                            <AppShell.Section
                                h="calc(100% - var(--mantine-spacing-md))"
                                bg="var(--mantine-color-body)"
                                p="lg"
                                mb="md"
                                style={{
                                    borderRadius: 'var(--mantine-radius-lg)',
                                    boxShadow: 'var(--mantine-shadow-xs)'
                                }}>
                                <ChatsSidebar
                                    navigate={(id, title) => {
                                        handleSetCurrentThreadId(id);
                                        setCurrentThreadTitle(title);
                                    }}
                                />
                            </AppShell.Section>
                        </AppShell.Navbar>
                        <AppShell.Main>
                            <Group w="100%" p="md" align="stretch">
                                <Chat />
                            </Group>
                        </AppShell.Main>
                    </StoreCacheContextProvider>
                </ThreadContextProvider>
            </AppShell>
        </AuthGuard>
    );
}
