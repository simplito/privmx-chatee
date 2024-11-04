import { Text, Box, Center, Loader, Space, Stack, Title } from '@mantine/core';

export function LoadingState({ title, subTitle }: { title: string; subTitle?: string }) {
    return (
        <Center flex={1} h="100%" w="100%">
            <Stack align="center">
                <Loader />
                <Space />
                <Box>
                    <Title order={2}>{title}</Title>
                    {subTitle ? <Text c="dimmed">{subTitle}</Text> : null}
                </Box>
            </Stack>
        </Center>
    );
}
