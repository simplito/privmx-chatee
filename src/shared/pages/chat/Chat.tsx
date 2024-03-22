'use client';
import { Group, Stack, Box, ThemeIcon, Text, Button, Tabs } from '@mantine/core';
import { IconFiles, IconMessage, IconMessages, IconPlus } from '@tabler/icons-react';
import { Sheet } from '@/shared/ui/atoms/sheet/Sheet';
import { useThreadContext, useThreadMessageContext } from '.';
import { openContextModal } from '@mantine/modals';
import { ChatMessageList } from './ChatMessageList';
import { InitiaLoadingMessageList } from './InitiaLoadingMessageList';
import { ReactNode } from 'react';
import { Blankslate } from '@/shared/ui/atoms/blankslate/Blankslate';
import { ChatFiles } from '../files';
import { useTranslations } from 'next-intl';
function ChatContainer({ children }: { children: ReactNode }) {
    return (
        <Sheet
            h="calc(100dvh - 32px - 70px)"
            style={{ flexGrow: 1, flexDirection: 'column' }}
            display={'flex'}>
            <Tabs h="100%" display={'flex'} variant="pills" defaultValue="CHAT">
                <Stack flex={1} h="100%" gap={0}>
                    {children}
                </Stack>
            </Tabs>
        </Sheet>
    );
}

function ChatHeader({ title, rightSection }: { title: string; rightSection: ReactNode }) {
    return (
        <Box
            p="lg"
            style={{
                borderBottom: 'var(--mantine-border)'
            }}>
            <Group justify="space-between">
                <Group>
                    <ThemeIcon variant="subtle">
                        <IconMessage size={16} />
                    </ThemeIcon>
                    <Text size="lg">{title}</Text>
                </Group>
                {rightSection}
            </Group>
        </Box>
    );
}

export function bytesSize(size: number) {
    if (size <= 0) {
        return '0B';
    }

    const base = 1024;
    const exp = Math.floor(Math.log(size) / Math.log(base));
    const result = size / Math.pow(base, exp);
    const rounded = Math.round(Math.floor(result * 100) / 100);
    return rounded + ' ' + (exp === 0 ? '' : 'KMGTPEZY'[exp - 1]) + 'B';
}

export function Chat() {
    const { status, ...ctx } = useThreadMessageContext();
    const client = useThreadContext();
    const t = useTranslations();

    const fileTabChange = (
        <Tabs.List>
            <Tabs.Tab value="CHAT" leftSection={<IconMessages size={12} />}>
                {t('chat.chat.chatMessages')}
            </Tabs.Tab>
            <Tabs.Tab value="FILES" leftSection={<IconFiles size={12} />}>
                {t('chat.chat.chatFiles')}
            </Tabs.Tab>
        </Tabs.List>
    );

    if (status === 'None') {
        return (
            <ChatContainer>
                <Blankslate
                    icon={<IconMessage />}
                    title={t('chat.chat.noChatSelectedTitle')}
                    subTitle={t('chat.chat.noChatSelectedSubtitle')}
                    primaryAction={
                        <Button
                            onClick={() =>
                                openContextModal({
                                    modal: 'createChat',
                                    innerProps: {}
                                })
                            }
                            leftSection={<IconPlus size={16} />}>
                            {t('chat.chat.addNewChat')}
                        </Button>
                    }
                />
            </ChatContainer>
        );
    }

    if (status === 'Initial') {
        return (
            <ChatContainer>
                <ChatHeader title={client.chatInfo.name} rightSection={fileTabChange} />
                <InitiaLoadingMessageList />
            </ChatContainer>
        );
    }

    return (
        <ChatContainer>
            <ChatHeader title={client.chatInfo.name} rightSection={fileTabChange} />
            <Tabs.Panel value="CHAT" h="100%">
                <ChatMessageList {...ctx} />
            </Tabs.Panel>
            <Tabs.Panel value="FILES" h="100%">
                <ChatFiles />
            </Tabs.Panel>
        </ChatContainer>
    );
}
