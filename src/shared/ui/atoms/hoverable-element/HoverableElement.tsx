import { Paper, PaperProps } from '@mantine/core';
import { HTMLAttributes } from 'react';
import styles from './hoverable-element.module.css';

export function HoverableElement({
    children,
    className,
    ...props
}: PaperProps & HTMLAttributes<HTMLDivElement>) {
    return (
        <Paper {...props} className={`${styles.hoverable} ${className}`}>
            {children}
        </Paper>
    );
}
