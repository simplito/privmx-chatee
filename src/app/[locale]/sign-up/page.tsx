'use client';
import useSignUp from '@/lib/hooks/useSignUp';
import { FinishedSignUp, SignUpForm } from '@/shared/pages/sign-up';
import { Step } from '@/shared/ui/atoms/step/Step';
import { Alert, Center, LoadingOverlay, ThemeIcon, Title } from '@mantine/core';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FormContainer } from '@/shared/ui/atoms/form-container';
export default function Page() {
    const [step, setStep] = useState<'invToken' | 'signIn' | 'done'>('signIn');
    const { register, status, setStatus } = useSignUp();
    const t = useTranslations();
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

                    const inviteToken = formData.get('token') as string;
                    const username = formData.get('username') as string;
                    const password = formData.get('password1') as string;

                    const isSuccess = await register(inviteToken, username, password);
                    if (isSuccess) {
                        setStep('done');
                    }
                }}>
                <LoadingOverlay visible={status === 'loading'} />
                <FormContainer.LeftPanel>
                    <ThemeIcon
                        c={'gray.0'}
                        size={'xl'}
                        variant="transparent"
                        ml="auto"
                        opacity={0.8}></ThemeIcon>
                    <Title ta="center" mt={0} order={3} c="gray.0" tw="balance">
                        {t('signUp.signUp')}
                    </Title>
                </FormContainer.LeftPanel>
                <FormContainer.RightPanel>
                    <Step visible={step === 'signIn'}>
                        <SignUpForm status={status} setStatus={setStatus} />

                        {status === 'error' && (
                            <Alert color="red" title={t('common.somethingWentWrong')}>
                                {t('signUp.form.error.signUpError')}
                            </Alert>
                        )}
                        {status === 'domain-blocked' && (
                            <Alert color="red" title={'Domain blocked'}>
                                Domain is curently unavailable
                            </Alert>
                        )}
                    </Step>
                    <Step visible={step === 'done'}>
                        <FinishedSignUp />
                    </Step>
                </FormContainer.RightPanel>
            </FormContainer>
        </Center>
    );
}
