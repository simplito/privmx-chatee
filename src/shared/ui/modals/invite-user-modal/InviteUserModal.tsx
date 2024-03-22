'use client';
import { useInviteToken } from '@/lib/hooks/useInviteToken';
import {
    Grid,
    TextInput,
    Group,
    Button,
    Checkbox,
    Text,
    Title,
    ActionIcon,
    ThemeIcon,
    Flex,
    TypographyStylesProvider,
    CopyButton,
    Tooltip,
    rem,
    Alert
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ContextModalProps } from '@mantine/modals';
import { IconCheck, IconCopy, IconUserPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Step } from '../../atoms/step/Step';
import { useTranslations } from 'next-intl';
export const InviteUserModal = ({ context, id }: ContextModalProps<{}>) => {
    const [step, setStep] = useState<'generate' | 'generated'>('generate');
    const [isFetching, { open: startFetching, close: finishFetching }] = useDisclosure(false);

    const { handleGetInviteToken, status, inviteToken } = useInviteToken();
    const t = useTranslations();
    useEffect(() => {
        if (status === 'success') {
            setStep('generated');
        }
    }, [status]);

    return (
        <>
            <Grid>
                <Grid.Col span={4} pos={'relative'}>
                    <TypographyStylesProvider c="gray.0" tw="balance">
                        <Flex
                            align={'flex-end'}
                            justify={'flex-end'}
                            direction={'column'}
                            bg={'var(--mantine-color-gray-7)'}
                            p="lg"
                            miw={200}
                            h="350px"
                            style={{ borderRadius: 'var(--mantine-radius-sm)' }}
                            inset={8}>
                            <ThemeIcon c={'inherit'} size={'xl'} variant="transparent" ml="auto">
                                <IconUserPlus size={32} />
                            </ThemeIcon>
                            <Title ta="right" mt={0} order={3}>
                                {t('chat.modals.inviteUserModal.inviteNewMember')}
                            </Title>
                            <Text ta="right" size="sm" tw="balance">
                                {t('chat.modals.inviteUserModal.howToPassInviteToken')}
                            </Text>
                        </Flex>
                    </TypographyStylesProvider>
                </Grid.Col>
                <Grid.Col span={8}>
                    <Step visible={step === 'generate'}>
                        <Title order={3} ta="center">
                            {t('chat.modals.inviteUserModal.inviteToken')}
                        </Title>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target as HTMLFormElement);
                                const isAdmin =
                                    formData.get('isAdmin')?.toString() === 'on' ? true : false;
                                startFetching();
                                await handleGetInviteToken(isAdmin);
                                finishFetching();
                            }}>
                            <Checkbox
                                name="isAdmin"
                                mb="md"
                                label={t('chat.modals.inviteUserModal.giveAdminRights')}
                            />
                            <Button loading={isFetching} fullWidth type="submit">
                                {t('chat.modals.inviteUserModal.generateNewToken')}
                            </Button>
                        </form>

                        {status === 'error' && (
                            <Alert title={t('common.error') + '!'} color="red">
                                <Text>{t('common.tryAgainLater')}</Text>
                            </Alert>
                        )}
                    </Step>
                    <Step visible={step === 'generated'}>
                        <Title order={3} ta="center">
                            {t('chat.modals.inviteUserModal.inviteToken')}
                        </Title>
                        <Group gap={8} w="100%" align="flex-end">
                            <TextInput
                                disabled
                                styles={{
                                    input: { border: 0, color: 'var(--mantine-color-gray-9)' }
                                }}
                                variant="filled"
                                style={{ flexGrow: 1 }}
                                value={inviteToken}
                            />
                            <CopyButton value={inviteToken} timeout={2000}>
                                {({ copied, copy }) => (
                                    <Tooltip
                                        label={
                                            copied
                                                ? t('chat.modals.inviteUserModal.copied')
                                                : t('chat.modals.inviteUserModal.copy')
                                        }
                                        withArrow
                                        position="right">
                                        <ActionIcon
                                            color={copied ? 'teal' : 'gray'}
                                            variant="outline"
                                            size={'lg'}
                                            onClick={copy}>
                                            {copied ? (
                                                <IconCheck style={{ width: rem(16) }} />
                                            ) : (
                                                <IconCopy size={16} />
                                            )}
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                            </CopyButton>
                        </Group>

                        <Button onClick={() => context.closeModal(id)}>{t('common.done')}</Button>
                    </Step>
                </Grid.Col>
            </Grid>
        </>
    );
};
