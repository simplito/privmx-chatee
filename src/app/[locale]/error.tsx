'use client';

import { Alert, Center, Divider, Text } from '@mantine/core';
import { IconError404 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

export default function Page({ error }: { error: Error & { digest?: string } }) {
    const t = useTranslations();

    return (
        <Center h="100%" w={'100%'} flex={1}>
            <Alert
                title={error.name}
                icon={<IconError404 />}
                miw={400}
                maw={1000}
                mih={200}
                color="red"
                p="xl">
                <Text>{t('error.looksLikeSomethingWentWrong')}</Text>
                <Divider my={'xs'} color="red" variant="dashed" />
                <Text size="sm">{t('error.errorMessage')}</Text>

                {error.message}
            </Alert>
        </Center>
    );
}
