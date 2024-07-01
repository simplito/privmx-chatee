'use client';
import { getInstanceDomain } from '@/shared/utils/domain';
import { Skeleton, Text, TextProps } from '@mantine/core';
import { useLayoutEffect, useState } from 'react';

export function DomainUrl({
    children,
    hostname,
    ...props
}: { hostname?: string; children?: string } & TextProps) {
    const [defaultHostname, setHostName] = useState<string | null>(hostname);

    useLayoutEffect(() => {
        if (!hostname) {
            setHostName(window.location.hostname);
        }
    }, [hostname]);

    if (hostname === null) {
        return (
            <Skeleton visible w="auto" opacity={0.5}>
                <Text c="dimmed" {...props}>
                    {children}
                </Text>
            </Skeleton>
        );
    }

    return (
        <Text c="dimmed" {...props}>
            {children}.{getInstanceDomain(defaultHostname)}
        </Text>
    );
}
