import { Box, Group, Stack, TextInput, Title } from '@mantine/core';
import { useLocale, useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import 'dayjs/locale/pl';
import 'dayjs/locale/en';
import { IconSearch } from '@tabler/icons-react';
import { Suspense } from 'react';
import { verifySession } from '@/shared/utils/auth';
import { OwnerContextProvider } from '@/shared/ui/context/UserContext';
import { Domains, NewDomainButton, OwnerPanelNavbar } from '@owner/ui';

export default function OwnerPage() {
    dayjs.locale(useLocale());

    const session = verifySession();
    if (!session) {
        <></>;
    }

    const t = useTranslations();

    return (
        <OwnerContextProvider>
            <OwnerPanelNavbar />
            <Box bg="white" bottom={0} top="25%" w="100%" pos="absolute" style={{ zIndex: 1 }} />
            <Stack
                p="lg"
                h="100%"
                maw={1500}
                w="100%"
                mx="auto"
                mt="md"
                pos={'relative'}
                style={{ zIndex: 5 }}>
                <Title order={1} mb="md">
                    {t('owner.title')}
                </Title>
                <Group>
                    <TextInput
                        flex={1}
                        leftSection={<IconSearch size="1rem" />}
                        placeholder={t('common.search')}
                    />
                    <NewDomainButton />
                </Group>
                <Suspense>
                    <Domains />
                </Suspense>
            </Stack>
        </OwnerContextProvider>
    );
}
