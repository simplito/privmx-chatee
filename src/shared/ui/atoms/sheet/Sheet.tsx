import { Paper, PaperProps } from '@mantine/core';
import { HTMLAttributes } from 'react';
import style from './style.module.css';

export function Sheet({
    children,
    className,
    ...props
}: Omit<PaperProps, 'shadow'> & HTMLAttributes<HTMLDivElement>) {
    return (
        <Paper radius={'lg'} className={`${style.sheet} ${className}`} {...props}>
            {children}
        </Paper>
    );
}
