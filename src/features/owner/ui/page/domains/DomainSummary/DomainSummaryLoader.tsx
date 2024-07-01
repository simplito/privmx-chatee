'use client';
import { Sheet } from '@atoms/sheet/Sheet';
import { Stack, Title, Text, Box, Group, ThemeIcon, Skeleton } from '@mantine/core';
import { IconCalendarStats, IconUser, IconCalendarPlus } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

export function DomainSummaryLoader() {
    const t = useTranslations();

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
                    <Skeleton width="40%" opacity={0.8} visible ml="xl">
                        <Text>02.02.2020</Text>
                    </Skeleton>
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
                    <Skeleton width="40%" opacity={0.8} visible ml="xl">
                        <Text>02.02.2020</Text>
                    </Skeleton>
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
                    <Skeleton width="40%" opacity={0.8} visible ml="xl">
                        <Text>02.02.2020</Text>
                    </Skeleton>
                </Box>
            </Stack>
        </Sheet>
    );
}
