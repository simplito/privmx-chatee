import { GridCol, Flex, FlexProps } from '@mantine/core';

export function LeftPanel({ children, ...props }: FlexProps) {
    return (
        <GridCol visibleFrom="sm" span={4} pos={'relative'}>
            <Flex
                align={'flex-end'}
                justify={'flex-end'}
                direction={'column'}
                bg={'var(--mantine-color-gray-8)'}
                p="md"
                h="100%"
                style={{ borderRadius: 'var(--mantine-radius-md)' }}
                inset={8}
                {...props}>
                {children}
            </Flex>
        </GridCol>
    );
}
