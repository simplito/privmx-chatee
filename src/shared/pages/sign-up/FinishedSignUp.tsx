import { Button, Stack, Title, Text } from '@mantine/core';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
export function FinishedSignUp() {
    const t = useTranslations();
    return (
        <>
            <Stack gap={4}>
                <Title ta={'center'}>{t('signUp.finished.done')}</Title>
                <Text c="dimmed" size="sm">
                    {t('signUp.finished.accountCreated')}
                </Text>
            </Stack>
            <Link href={'/sign-in'}>
                <Button fullWidth>{t('signUp.finished.signIn')}</Button>
            </Link>
        </>
    );
}
