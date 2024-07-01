'use server';
import { Group, Paper, Text, ThemeIcon } from '@mantine/core';
import { DomainUrl } from './DomainUrl';
import { headers } from 'next/headers';
import { IconLock } from '@tabler/icons-react';
import styles from './style.module.css';
import Link from 'next/link';
import hover from '@atoms/hoverable-element/hoverable-element.module.css';

export async function DomainCard({
    name,
    domain,
    status
}: {
    name: string;
    domain: string;
    status: boolean;
}) {
    const headerList = headers();
    const hostname = headerList.get('host');

    return (
        <Paper
            className={`${styles.card} ${hover.hoverable}`}
            opacity={status ? 0.7 : 1}
            shadow="xs"
            radius={'md'}
            p="xl"
            miw={'calc(20% - var(--mantine-spacing-md) '}
            h={150}
            component={Link}
            href={`/owner/${domain}`}
            withBorder>
            <Group justify="space-between" wrap="nowrap" gap={4}>
                <Group wrap="nowrap">
                    <Text size="xl" truncate="end">
                        {name}
                    </Text>
                    {status && (
                        <ThemeIcon size={'xs'} variant="light">
                            <IconLock size={16} />
                        </ThemeIcon>
                    )}
                </Group>
            </Group>
            <DomainUrl hostname={hostname}>{domain}</DomainUrl>
        </Paper>
    );
}
