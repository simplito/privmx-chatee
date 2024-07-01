import { AppShell, AppShellMain } from '@mantine/core';
import { ReactNode } from 'react';

export default function OwnerLayout({ children }: { children: ReactNode }) {
    return (
        <AppShell bg="var(--mantine-color-app-body)" header={{ height: 70 }}>
            <AppShellMain pos={'relative'} display={'flex'} style={{ flexDirection: 'column' }}>
                {children}
            </AppShellMain>
        </AppShell>
    );
}
