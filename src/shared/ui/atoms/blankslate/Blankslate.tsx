import { Center, Space, Stack, ThemeIcon, Title, Text, Box } from '@mantine/core';
import { ReactNode } from 'react';

export function Blankslate({
    icon,
    primaryAction,
    title,
    subTitle
}: {
    icon: ReactNode;
    title: string;
    subTitle?: string;
    primaryAction: ReactNode;
}) {
    return (
        <Center flex={1} h="100%" w="100%">
            <Stack align="center">
                <ThemeIcon size={'lg'} variant="transparent">
                    {icon}
                </ThemeIcon>
                <Space />
                <Box>
                    <Title ta="center" order={2}>
                        {title}
                    </Title>
                    {subTitle ? (
                        <Text ta="center" c="dimmed">
                            {subTitle}
                        </Text>
                    ) : null}
                </Box>
                <Space />
                {primaryAction}
            </Stack>
        </Center>
    );
}
