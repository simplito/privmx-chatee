'use client';
import useSignIn from '@/lib/hooks/useSignIn';
import { Step } from '@/shared/ui/atoms/step/Step';
import {
    Center,
    Paper,
    Grid,
    Flex,
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

export default function Page() {
    const { signIn, status, setStatus } = useSignIn();
    const t = useTranslations();
    const nameInput = useInitialFocus();

    return (
        <Center h="100%" style={{ flexGrow: 1 }}>
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);

                    const username = formData.get('username') as string;
                    const password = formData.get('password') as string;

                    await signIn(username, password);
                }}>
                <Paper
                    pos="relative"
                    shadow="xs"
                    radius={'lg'}
                    p="lg"
                    miw={720}
                    mih={513}
                    display={'flex'}
                    style={{ flexDirection: 'column' }}>
                    <LoadingOverlay visible={status === 'loading'} />

                    <Grid
                        flex={1}
                        align="stretch"
                        gutter={'md'}
                        styles={{
                            root: { display: 'flex', flexDirection: 'column' },
                            inner: { flexGrow: 1 }
                        }}>
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
                                <Title
                                    ta="center"
                                    mt={0}
                                    order={2}
                                    opacity={0.9}
                                    c="gray.0"
                                    tw="balance">
                                    Chatee
                                </Title>
                            </Flex>
                        </Grid.Col>
                        <Grid.Col span={8}>
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
                            </Step>
                        </Grid.Col>
                    </Grid>
                </Paper>
            </form>
        </Center>
    );
}
