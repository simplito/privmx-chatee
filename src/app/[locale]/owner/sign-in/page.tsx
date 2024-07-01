'use client';

import { useInitialFocus } from '@/shared/hooks/useInitialFocus';
import { FormContainer } from '@/shared/ui/atoms/form-container';
import { Step } from '@/shared/ui/atoms/step/Step';
import { UserContextActionTypes, useUserContext } from '@/shared/ui/context/UserContext';
import {
    Center,
    LoadingOverlay,
    ThemeIcon,
    Title,
    Stack,
    PasswordInput,
    Button,
    Alert
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { useOwnerSignIn } from '@owner/logic';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

export default function OwnerSignIn() {
    const t = useTranslations();
    const { ownerSignIn, status, setStatus } = useOwnerSignIn();
    const { dispatch } = useUserContext();

    const nameInput = useInitialFocus();

    useEffect(() => {
        modals.closeAll();
        dispatch({ type: UserContextActionTypes.SIGN_OUT });
    }, [dispatch]);

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
                    const token = formData.get('token').toString();

                    await ownerSignIn(token);
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
                        <Title order={3}>{t('owner.sign-in.title')}</Title>
                        <Stack gap={4}>
                            <PasswordInput
                                required
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
                                name="token"
                                label={t('owner.sign-in.ownerToken')}
                            />
                        </Stack>
                        <Button type="submit">{t('signIn.form.signIn')}</Button>

                        {status === 'error' && (
                            <Alert color="red" title={t('signIn.form.errors.signInFailed')}>
                                {t('common.tryAgainLater')}
                            </Alert>
                        )}
                    </Step>
                </FormContainer.RightPanel>
            </FormContainer>
        </Center>
    );
}
