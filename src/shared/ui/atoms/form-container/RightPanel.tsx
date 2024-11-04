import { Grid, GridColProps } from '@mantine/core';

export function RightPanel({ children, ...props }: GridColProps) {
    return (
        <Grid.Col span={{ base: 12, sm: 8 }} px="lg" {...props}>
            {children}
        </Grid.Col>
    );
}
