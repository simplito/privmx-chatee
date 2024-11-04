import { ActionIcon, Group, Paper, Progress, Stack, Transition } from '@mantine/core';
import { FormEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNotification } from '@/shared/hooks/useNotification';
import { Virtuoso } from 'react-virtuoso';
import { useInterval } from '@mantine/hooks';
import { MessageInput } from './message-input';
import { FileBadge } from './file-badge';
import { IconX } from '@tabler/icons-react';
import { groupMessages, MessageGroup } from './message';
import { useTranslations } from 'next-intl';
import { UserEvent } from '@srs/AppBus';
import { useApp } from '@srs/ReactBindings';
import { useThreadContext } from '@chat/logic';
import { ChatMessage } from '@chat/logic/messages-system/types';

export function ChatMessageList({
    allMessagesLength,
    hasMoreMessages,
    messages,
    sendMessage,
    requestNextMessageFrame,
    isFetchingNextPage = false,
    sendFileMessage,
    deleteMessage
}: {
    sendMessage: (msg: { text: string }) => Promise<void>;
    messages: ChatMessage[];
    isFetchingNextPage?: boolean;
    allMessagesLength: number;
    hasMoreMessages: boolean;
    requestNextMessageFrame: () => Promise<void>;
    sendFileMessage: (msg: { file: File }) => Promise<void>;
    deleteMessage: (messageId: string, threadId: string) => Promise<void>;
}) {
    const { showError } = useNotification();

    const [files, setFile] = useState<File[]>([]);
    const t = useTranslations();
    const pageVisited = useRef(false);
    const client = useThreadContext();

    const app = useApp();

    useEffect(() => {
        if (!pageVisited.current) {
            app.eventBus.emit(UserEvent.pageEnter('chat', client.chatId, client.storeId));
            pageVisited.current = true;
        }

        return () => {
            app.eventBus.emit(UserEvent.pageLeave('chat', client.chatId, client.storeId));
        };
    }, [app.eventBus, client.chatId, client.storeId]);

    const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const text = `${formData.get('text')}`;
        try {
            if (text.trim().length === 0 && !files) {
                return;
            }
            form.reset();
            setFile([]);
            if (text) {
                sendMessage({ text });
            }
            if (files.length > 0) {
                files.map((file) => sendFileMessage({ file }));
            }
        } catch (error) {
            showError(t('chat.chatMessageList.sendMessageError'));
        }
    };

    const virtuoso = useRef(null);
    const followOutput = useCallback((isAtBottom: boolean) => {
        return isAtBottom ? 'auto' : false;
    }, []);

    const groups = useMemo(() => groupMessages(messages), [messages]);

    const filesList =
        files.length > 0 &&
        files.map((file, i) => (
            <FileBadge
                fileName={file.name}
                key={`${file.name}-${i}`}
                onDelete={() =>
                    setFile((prev) => prev.filter((prevFile) => prevFile.name !== file.name))
                }
            />
        ));

    return (
        <Stack pos="relative" mih={46} gap={0} flex={1} p="lg" pr={0} pt={0} h="100%">
            {isFetchingNextPage && <LoadingProgres isLoading={isFetchingNextPage} />}
            <Virtuoso
                ref={virtuoso}
                initialTopMostItemIndex={groups.length - 1}
                firstItemIndex={Math.max(0, allMessagesLength - groups.length)}
                itemContent={(index, message) => (
                    <MessageGroup
                        key={message.messages[0].sentDate}
                        group={message}
                        deleteMessage={deleteMessage}
                    />
                )}
                data={groups}
                startReached={() => {
                    if (hasMoreMessages) {
                        requestNextMessageFrame();
                    }
                }}
                followOutput={followOutput}
                style={{
                    overscrollBehavior: 'contain',
                    display: 'flex',
                    padding: 'var(--mantine-spacing-md) 0'
                }}
                increaseViewportBy={{ top: 800, bottom: 600 }}
            />
            <form onSubmit={handleSubmit}>
                <Transition
                    mounted={!!files && files?.length !== 0}
                    duration={150}
                    exitDuration={50}
                    transition={'slide-up'}>
                    {(style) => (
                        <Paper
                            w="auto"
                            style={style}
                            p="xs"
                            mb={8}
                            bg={'gray.0'}
                            mr="lg"
                            radius={'lg'}>
                            <Group flex={1} justify="space-between">
                                <Group gap={'sm'}>{filesList}</Group>
                                <ActionIcon size={20} variant={'subtle'}>
                                    <IconX onClick={() => setFile([])} />
                                </ActionIcon>
                            </Group>
                        </Paper>
                    )}
                </Transition>
                <MessageInput setFiles={setFile} />
            </form>
        </Stack>
    );
}

function LoadingProgres({ isLoading }: { isLoading: boolean }) {
    const [progres, setProgres] = useState(2);
    const interval = useInterval(() => setProgres((s) => s + s * 4), 100);

    useEffect(() => {
        if (isLoading) {
            interval.start();
        } else {
            interval.stop();
            setProgres(0);
        }
        return () => {
            interval.stop();
        };
    }, [interval, isLoading]);

    return (
        <Progress
            style={{ zIndex: 100 }}
            value={progres}
            pos="absolute"
            top={4}
            left={4}
            right={4}
            size="sm"
            opacity={0.8}
            transitionDuration={200}
        />
    );
}
