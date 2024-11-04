'use client';

import { ActionIcon, ActionIconProps } from '@mantine/core';
import { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

export function FormLoadingButton({
    children,
    ...props
}: { children: ReactNode } & ActionIconProps) {
    const { pending } = useFormStatus();

    return (
        <ActionIcon variant="transparent" c="inherit" component="div" loading={pending} {...props}>
            {children}
        </ActionIcon>
    );
}
