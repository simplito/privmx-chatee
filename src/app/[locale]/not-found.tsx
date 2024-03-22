import { NEXT_PUBLIC_BACKEND_URL } from '@/shared/utils/env';
import { Anchor, Center, Group, Stack, Text } from '@mantine/core';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Page() {
    const t = useTranslations();

    return (
        <Center h="100%" style={{ flexGrow: 1 }}>
            <Stack align="center">
                <Text fw="bold">404 - {t('notFound.siteNotFound')}</Text>

                <Group gap={4}>
                    {t('notFound.goToHomePage')}
                    <Anchor component={Link} href={NEXT_PUBLIC_BACKEND_URL} underline="always">
                        Chatee
                    </Anchor>
                </Group>
            </Stack>
        </Center>
    );
}
