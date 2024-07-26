import { FormContainer } from '@atoms/form-container';
import {
    Group,
    Stack,
    ThemeIcon,
    Title,
    Text,
    Space,
    ActionIcon,
    CopyButton,
    TextInput,
    Tooltip,
    rem,
    Button,
    Alert
} from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { IconCheck, IconCopy, IconHomeCheck, IconInfoCircle } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

export function CreateDomainSuccessModal({
    context,
    innerProps
}: ContextModalProps<{ invitationToken: string }>) {
    const t = useTranslations();
    const icon = <IconInfoCircle />;

    return (
        <FormContainer mih={0} pos="relative">
            <FormContainer.LeftPanel />
            <FormContainer.RightPanel>
                <Stack h="100%" justify="center">
                    <Group gap={4} align="center" mt="md">
                        <ThemeIcon variant="transparent" size={'sm'}>
                            <IconHomeCheck />
                        </ThemeIcon>
                        <Title order={2}>{t('owner.createDomainSuccess.title')}</Title>
                    </Group>
                    <Text size="sm" c="dimmed"></Text>
                    <Alert
                        mb="md"
                        variant="light"
                        color="orange"
                        title={t('owner.createDomainSuccess.alertTitle')}
                        icon={icon}>
                        <Text c="orange.7" size="sm">
                            {t('owner.createDomainSuccess.subtitle')}
                        </Text>
                    </Alert>
                    <Group>
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
                            size="md"
                            value={innerProps.invitationToken || ''}
                        />
                        <CopyButton value={innerProps.invitationToken} timeout={2000}>
                            {({ copied, copy }) => (
                                <Tooltip
                                    openDelay={300}
                                    label={
                                        copied
                                            ? t('chat.modals.domainModal.copied')
                                            : t('chat.modals.domainModal.copy')
                                    }>
                                    <ActionIcon variant="light" h={36} w={36} onClick={copy}>
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

                    <Space my="lg" h="lg" />
                    <Group justify="center">
                        <Button
                            onClick={() => {
                                context.closeAll();
                            }}>
                            {t('common.done')}
                        </Button>
                    </Group>
                </Stack>
            </FormContainer.RightPanel>
        </FormContainer>
    );
}
