'use client';
import { useLocaleDate } from '@/shared/hooks/useLocaleDate';
import { Sheet } from '@atoms/sheet/Sheet';
import { Stack, Title, Box, Group, ThemeIcon, Text } from '@mantine/core';
import { IconCalendarStats, IconUser, IconCalendarPlus } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

export function DomainSummaryView({
    createdDate,
    lastActiveDate,
    usersCount
}: {
    lastActiveDate?: number;
    usersCount?: number;
    createdDate?: number;
}) {
    const t = useTranslations();
    const { displayDate } = useLocaleDate();

    return (
        <Sheet p="lg">
            <Stack>
                <Title order={4}>{t('owner.domain.summary.title')}</Title>

                <Box>
                    <Group align="center" gap={'sm'}>
                        <ThemeIcon size={'sm'} variant="transparent">
                            <IconCalendarStats size={16} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed">
                            {t('owner.domain.summary.lastActive')}
                        </Text>
                    </Group>
                    {lastActiveDate ? (
                        <Text ml="xl">{displayDate(lastActiveDate)}</Text>
                    ) : (
                        <Text ml="xl" c="dimmed">
                            No data
                        </Text>
                    )}
                </Box>
                <Box>
                    <Group align="center" gap={'sm'}>
                        <ThemeIcon size={'sm'} variant="transparent">
                            <IconUser size={16} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed">
                            {t('owner.domain.summary.usersCount')}
                        </Text>
                    </Group>
                    {usersCount ? (
                        <Text ml="xl">{usersCount}</Text>
                    ) : (
                        <Text ml="xl" c="dimmed">
                            No data
                        </Text>
                    )}
                </Box>
                <Box>
                    <Group align="center" gap={'sm'}>
                        <ThemeIcon size={'sm'} variant="transparent">
                            <IconCalendarPlus size={16} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed">
                            {t('owner.domain.summary.createdAt')}
                        </Text>
                    </Group>
                    {createdDate ? (
                        <Text ml="xl">{displayDate(createdDate)}</Text>
                    ) : (
                        <Text ml="xl" c="dimmed">
                            No data
                        </Text>
                    )}
                </Box>
            </Stack>
        </Sheet>
    );
}
