'use client';
import useSignUp from '@/lib/hooks/useSignUp';
import { FinishedSignUp, SignUpForm } from '@/shared/pages/sign-up';
import { Step } from '@/shared/ui/atoms/step/Step';
import { Alert, Center, Flex, Grid, LoadingOverlay, Paper, ThemeIcon, Title } from '@mantine/core';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
export default function Page() {
    const [step, setStep] = useState<'invToken' | 'signIn' | 'done'>('signIn');
    const { register, status, setStatus } = useSignUp();
    const t = useTranslations();
    return (
        <Center h="100%" style={{ flexGrow: 1 }}>
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);

                    const inviteToken = formData.get('token') as string;
                    const username = formData.get('username') as string;
                    const password = formData.get('password1') as string;

                    try {
                        await register(inviteToken, username, password);
                        setStep('done');
                    } catch (error) {
                        console.error(error);
                    }
                }}>
                <Paper
                    shadow="xs"
                    radius={'lg'}
                    p="lg"
                    miw={720}
                    mih={513}
                    display={'flex'}
                    style={{ flexDirection: 'column' }}>
                    <Grid
                        flex={1}
                        align="stretch"
                        gutter={'md'}
                        styles={{
                            root: { display: 'flex', flexDirection: 'column' },
                            inner: { flexGrow: 1 }
                        }}>
                        <LoadingOverlay visible={status === 'loading'} />
                        <Grid.Col span={4} pos={'relative'}>
                            <Flex
                                align={'flex-end'}
                                justify={'flex-end'}
                                direction={'column'}
                                bg={'var(--mantine-color-gray-8)'}
                                p="md"
                                h="100%"
                                style={{ borderRadius: 'var(--mantine-radius-md)' }}
                                inset={8}>
                                <ThemeIcon
                                    c={'gray.0'}
                                    size={'xl'}
                                    variant="transparent"
                                    ml="auto"
                                    opacity={0.8}></ThemeIcon>
                                <Title ta="center" mt={0} order={3} c="gray.0" tw="balance">
                                    {t('signUp.signUp')}
                                </Title>
                            </Flex>
                        </Grid.Col>
                        <Grid.Col span={8}>
                            <Step visible={step === 'signIn'}>
                                <SignUpForm status={status} setStatus={setStatus} />

                                {status === 'error' && (
                                    <Alert color="red" title={t('common.somethingWentWrong')}>
                                        {t('signUp.form.error.signUpError')}
                                    </Alert>
                                )}
                            </Step>
                            <Step visible={step === 'done'}>
                                <FinishedSignUp />
                            </Step>
                        </Grid.Col>
                    </Grid>
                </Paper>
            </form>
        </Center>
    );
}
