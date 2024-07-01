'use client';

import { useInitialFocus } from '@/shared/hooks/useInitialFocus';
import { FormContainer } from '@/shared/ui/atoms/form-container';
import { Step } from '@/shared/ui/atoms/step/Step';
import {
    Center,
    ThemeIcon,
    Title,
    Stack,
    PasswordInput,
    Button,
    Alert,
    LoadingOverlay
} from '@mantine/core';
import { useCreateOwnerToken } from '@owner/logic';
import { useTranslations } from 'next-intl';

export default function CreateOwnerTokenForm() {
    const t = useTranslations();
    const { createOwnerToken, status, setStatus } = useCreateOwnerToken();

    const nameInput = useInitialFocus();

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
                    const token = formData.get('owner-token').toString();

                    await createOwnerToken(token);
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
                        <Title order={3}>{t('owner.create-token.header')}</Title>
                        <Stack gap={4}>
                            <PasswordInput
                                required
                                ref={nameInput}
                                onFocus={() => {
                                    setStatus('default');
                                }}
                                error={undefined}
                                name="owner-token"
                                label={t('owner.create-token.input-label')}
                            />
                        </Stack>
                        <Button type="submit">{t('owner.create-token.create')}</Button>

                        {status === 'error' && (
                            <Alert color="red" title={t('owner.create-token.error.duringCreation')}>
                                {t('common.tryAgainLater')}
                            </Alert>
                        )}
                    </Step>
                </FormContainer.RightPanel>
            </FormContainer>
        </Center>
    );
}
