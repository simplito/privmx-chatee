'use client';
import { useInviteToken } from '@/lib/hooks/useInviteToken';
import {
    TextInput,
    Group,
    Button,
    Text,
    Title,
    ActionIcon,
    ThemeIcon,
    CopyButton,
    Tooltip,
    rem,
    Alert,
    Stack,
    Switch,
    LoadingOverlay
} from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { IconCheck, IconCopy, IconPlus, IconUserPlus } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { FormContainer } from '../../atoms/form-container';
import { EventHandler, SyntheticEvent } from 'react';

export const InviteUserModal = ({ context, id }: ContextModalProps<{}>) => {
    const {
        handleGetInviteToken,
        status: inviteTokenStatus,
        inviteToken,
        clearInviteToken
    } = useInviteToken();

    const t = useTranslations();

    const handleSubmit: EventHandler<SyntheticEvent> = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const isAdmin = formData.get('isAdmin')?.toString() === 'on' ? true : false;
        await handleGetInviteToken(isAdmin);
    };

    return (
        <FormContainer pos="relative">
            <FormContainer.LeftPanel></FormContainer.LeftPanel>
            <FormContainer.RightPanel>
                <LoadingOverlay visible={inviteTokenStatus === 'loading'} />
                <Stack h="100%">
                    <Group gap={4} align="center" mt={'lg'}>
                        <ThemeIcon variant="transparent" size={'sm'}>
                            <IconUserPlus />
                        </ThemeIcon>
                        <Title order={3}>Nowy Token Zaproszenia</Title>
                    </Group>
                    <Text size="sm" c="dimmed">
                        Przekaż token zaproszenia pierwszemu adminowi domeny.
                    </Text>
                    <form
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 1,
                            justifyContent: 'center'
                        }}
                        onSubmit={handleSubmit}>
                        <Stack>
                            <Group gap={8} w="100%" align="flex-end">
                                <Button
                                    leftSection={<IconPlus size="1rem" />}
                                    type="submit"
                                    size="sm"
                                    loading={inviteTokenStatus === 'loading'}>
                                    {t('chat.modals.domainModal.newToken')}
                                </Button>
                                <TextInput
                                    disabled
                                    styles={{
                                        input: {
                                            background: 'var(--mantine-color-gray-0)',
                                            opacity: 0.9,
                                            cursor: 'default'
                                        }
                                    }}
                                    flex={1}
                                    size="sm"
                                    value={inviteToken || ''}
                                />
                                <CopyButton value={inviteToken} timeout={2000}>
                                    {({ copied, copy }) => (
                                        <Tooltip
                                            openDelay={300}
                                            label={
                                                copied
                                                    ? t('chat.modals.domainModal.copied')
                                                    : t('chat.modals.domainModal.copy')
                                            }>
                                            <ActionIcon
                                                variant="light"
                                                h={36}
                                                w={36}
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
                            <Switch
                                onChange={() => {
                                    clearInviteToken();
                                }}
                                size="sm"
                                label={t('chat.modals.domainModal.userWithAdminPrivileges')}
                                name="isAdmin"
                            />
                        </Stack>
                    </form>
                    <Group justify="center" mt="auto">
                        <Button variant="light" type="submit">
                            Gotowe
                        </Button>
                        <Button
                            onClick={() => context.closeModal(id)}
                            type="button"
                            variant="outline">
                            Anuluj
                        </Button>
                    </Group>

                    {inviteTokenStatus === 'error' && (
                        <Alert title={t('common.error') + '!'} color="red">
                            <Text>{t('common.tryAgainLater')}</Text>
                        </Alert>
                    )}
                </Stack>
            </FormContainer.RightPanel>
        </FormContainer>
    );
};
