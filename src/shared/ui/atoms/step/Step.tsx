import { Stack, StackProps } from '@mantine/core';

export function Step({ children, visible, ...props }: StackProps & { visible?: boolean }) {
    return (
        <Stack
            gap={'lg'}
            justify="center"
            h="100%"
            w="80%"
            mx="auto"
            display={visible ? 'flex' : 'none'}
            {...props}>
            {children}
        </Stack>
    );
}
