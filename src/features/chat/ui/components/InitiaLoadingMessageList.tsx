'use client';
import { Stack, Box } from '@mantine/core';
import { Message } from '.';
import { MessageInput } from './message-input';

export function InitiaLoadingMessageList() {
    return (
        <Stack gap={0} pos="relative" mih={46} flex={1} p="lg" pt={0} h="100%">
            <Box mih={46} flex={1} mb={'md'} style={{ overflowY: 'auto' }}>
                <Stack gap={0}>
                    {new Array(15).fill('').map((message, i) => (
                        <Message loading key={i} message={message} />
                    ))}
                </Stack>
            </Box>
            <form>
                <MessageInput disabled setFiles={() => {}} />
            </form>
        </Stack>
    );
}
