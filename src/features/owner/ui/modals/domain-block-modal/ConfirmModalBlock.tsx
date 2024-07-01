'use client';

import { Stack, Group, ThemeIcon, Title, Space, Text, TextInput, Button, Box } from '@mantine/core';
import { ContextModalProps, modals } from '@mantine/modals';
import { blockDomainFormStateAction } from '@/features/owner/logic/actions/block-domain';
import { IconHomeCancel } from '@tabler/icons-react';
import { FormContainer } from '@atoms/form-container';
import { useInputState } from '@mantine/hooks';
import { useFormState } from 'react-dom';
import { useEffect } from 'react';
import { FormLoadingOverlay } from '@atoms/form-loading-overlay/FormLoadingOverlay';
import { FORM_STATUS } from '@/shared/utils/types';

export function ConfirmDomainBlockModal({
    context,
    id,
    innerProps
}: ContextModalProps<{ domainName: string; domainToBlock: string }>) {
    const [confirmationText, setConfirmationText] = useInputState('');

    const domainName = innerProps.domainName;
    const domainRoute = innerProps.domainToBlock;

    const [formState, action] = useFormState(blockDomainFormStateAction, {
        status: FORM_STATUS.DEFAULT
    });

    useEffect(() => {
        if (formState.status === 'success') {
            context.closeModal(id);
        }
    }, [context, formState.status, id]);

    return (
        <FormContainer mih={0}>
            <FormContainer.LeftPanel></FormContainer.LeftPanel>
            <FormContainer.RightPanel pos="relative">
                <form action={action}>
                    <FormLoadingOverlay />
                    <Stack>
                        <Box>
                            <Group wrap="nowrap" gap={0} align="flex-start" mt="md">
                                <ThemeIcon variant="transparent" size={'sm'} pb={0}>
                                    <IconHomeCancel />
                                </ThemeIcon>
                                <Title order={3} tw="pretty" lineClamp={1} ml={8} flex={1}>
                                    Zablokować domenę: &quot;{domainName}&quot; ?
                                </Title>
                            </Group>

                            <Text c="dimmed">
                                Dostęp do domeny zostanie wyłączony, nie usuwając żadnych danych
                                użytkowników.
                            </Text>
                        </Box>
                        <Space h="lg" mb="xl" />
                        <input type="hidden" name="domain" value={domainRoute} />
                        <input type="hidden" name="isBlocked" value={'true'} />

                        <TextInput
                            required
                            label={`Wpisz nazwę domeny: "${domainName}"`}
                            name="owner_token"
                            value={confirmationText}
                            onChange={setConfirmationText}
                        />

                        <Space h="lg" my="xl" />
                        <Group justify="center" mt="auto">
                            <Button type="submit" disabled={confirmationText !== domainName}>
                                Zablokuj domenę
                            </Button>
                            <Button
                                onClick={() => modals.closeAll()}
                                type="button"
                                variant="outline">
                                Anuluj
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </FormContainer.RightPanel>
        </FormContainer>
    );
}
