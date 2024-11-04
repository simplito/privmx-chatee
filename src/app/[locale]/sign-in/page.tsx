'use client';
import useSignIn from '@/lib/hooks/useSignIn';
import { Step } from '@/shared/ui/atoms/step/Step';
import {
    Center,
    ThemeIcon,
    Title,
    PasswordInput,
    Button,
    TextInput,
    Stack,
    LoadingOverlay,
    Group,
    Text,
    Anchor,
    Alert
} from '@mantine/core';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useInitialFocus } from '@/shared/hooks/useInitialFocus';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useNotification } from '@/shared/hooks/useNotification';
import { FormContainer } from '@/shared/ui/atoms/form-container';

export default function Page() {
    const { signIn, status, setStatus } = useSignIn();
    const t = useTranslations();
    const nameInput = useInitialFocus();
    const searchParams = useSearchParams();
    const { showError } = useNotification();

    useEffect(() => {
        const sessionExpired = searchParams.get('session-expired');

        if (sessionExpired) {
            showError(t('common.sessionExpired'));
        }
    }, [searchParams, showError, t]);

    return (
        <Center h="100%" style={{ flexGrow: 1 }}>
            <FormContainer
                mx="lg"
                containerProps={{
                    p: 'lg',
                    miw: { base: '100%', sm: '720px' }
                }}
                withShadow
                component="form"
                onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);

                    const username = formData.get('username') as string;
                    const password = formData.get('password') as string;

                    await signIn(username, password);
                }}>
                <LoadingOverlay visible={status === 'loading'} />

                <FormContainer.LeftPanel>
                    <ThemeIcon
                        c={'gray.0'}
                        size={'xl'}
                        variant="transparent"
                        ml="auto"
                        opacity={0.8}></ThemeIcon>
                    <Title ta="center" mt={0} order={2} opacity={0.9} c="gray.0" tw="balance">
                        Chatee
                    </Title>
                </FormContainer.LeftPanel>

                <FormContainer.RightPanel>
                    <Step visible>
                        <Title order={3}>{t('signIn.signinIn')}</Title>
                        <Stack gap={4}>
                            <TextInput
                                ref={nameInput}
                                onFocus={() => {
                                    if (status === 'invalid-credentials') {
                                        setStatus('default');
                                    }
                                }}
                                error={
                                    status === 'invalid-credentials'
                                        ? t('signIn.form.errors.invalidCredentials')
                                        : undefined
                                }
                                name="username"
                                label={t('signIn.form.username')}
                            />
                            <PasswordInput
                                onFocus={() => {
                                    if (status === 'invalid-credentials') {
                                        setStatus('default');
                                    }
                                }}
                                error={
                                    status === 'invalid-credentials'
                                        ? t('signIn.form.errors.invalidCredentials')
                                        : undefined
                                }
                                name="password"
                                label={t('signIn.form.password')}
                            />
                        </Stack>
                        <Button type="submit">{t('signIn.form.signIn')}</Button>

                        <Group gap={4}>
                            <Text c="dimmed" size="sm">
                                {t('signIn.noAccount')}
                            </Text>

                            <Anchor size="sm" component={Link} href="/sign-up">
                                {t('signIn.register')}
                            </Anchor>
                        </Group>

                        {status === 'error' && (
                            <Alert color="red" title={t('signIn.form.errors.signInFailed')}>
                                {t('common.tryAgainLater')}
                            </Alert>
                        )}
                        {status === 'domain-blocked' && (
                            <Alert color="red" title="Domain blocked">
                                {t('signIn.form.errors.domainUnavailable')}
                            </Alert>
                        )}
                        {status === 'no-access-period' && (
                            <Alert color="red" title="Domain blocked">
                                {t('signIn.form.errors.noAccessPeriod')}
                            </Alert>
                        )}
                    </Step>
                </FormContainer.RightPanel>
            </FormContainer>
        </Center>
    );
}
