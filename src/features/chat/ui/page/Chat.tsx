'use client';
import { ReactNode } from 'react';
import { Group, Stack, Box, ThemeIcon, Text, Button, Tabs } from '@mantine/core';
import { IconFiles, IconMessage, IconMessages, IconPlus } from '@tabler/icons-react';
import { Sheet } from '@atoms/sheet';
import { Blankslate } from '@atoms/blankslate';
import { openContextModal } from '@mantine/modals';
import { useThreadContext, useThreadMessageContext } from '@chat/logic';
import { useTranslations } from 'next-intl';
import { ChatMessageList, InitiaLoadingMessageList } from '../components';
import { ChatFiles } from './ChatFiles';
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
                <Group gap={4}>
                    <ThemeIcon variant="subtle">
                        <IconMessage size={16} />
                    </ThemeIcon>
                    <Text size="lg" visibleFrom="md">
                        {title}
                    </Text>
                    <Text size="sm" hiddenFrom="md">
                        {title}
                    </Text>
                </Group>
                {rightSection}
            </Group>
        </Box>
    );
}

// eslint-disable-next-line no-unused-vars
export function Chat({ navigate }: { navigate: (id: string, title: string) => void }) {
    const { status, ...ctx } = useThreadMessageContext();
    const client = useThreadContext();
    const t = useTranslations();

    const fileTabChange = (
        <Tabs.List>
            <Tabs.Tab
                p="xs"
                value="CHAT"
                styles={{
                    tabSection: {
                        marginRight: 0
                    }
                }}
                leftSection={<IconMessages size={16} />}>
                <Text size="xs" visibleFrom="md" ml="xs">
                    {t('chat.chat.chatMessages')}
                </Text>
            </Tabs.Tab>
            <Tabs.Tab
                p="xs"
                value="FILES"
                styles={{
                    tabSection: {
                        marginRight: 0
                    }
                }}
                leftSection={<IconFiles size={16} />}>
                <Text size="xs" visibleFrom="md" ml="xs">
                    {t('chat.chat.chatFiles')}
                </Text>
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
                                    innerProps: { navigate }
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
