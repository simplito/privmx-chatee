'use client';
import { NEXT_PUBLIC_BACKEND_URL } from '@/shared/utils/env';
import {
    LoadingOverlay,
    Stack,
    Group,
    ThemeIcon,
    Title,
    Space,
    Alert,
    Button,
    PasswordInput
} from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { IconExclamationCircle, IconKey } from '@tabler/icons-react';
import { useState, SyntheticEvent } from 'react';
import { FormContainer } from '@atoms/form-container';
import { FormStatus } from '@utils/types';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/shared/hooks/useNotification';
import { generateEndpointKeyPair } from '@/lib/endpoint-api/utils';
import { OwnerChangeTokenRequestBody, OwnerChangeTokenResult } from '@owner/logic';

export function ChangeOwnerTokenModal({
    context,
    id
}: // eslint-disable-next-line no-unused-vars
ContextModalProps<{}>) {
    const [error, setError] = useState<null | FormStatus | 'invalid-token' | 'non-matching-tokens'>(
        null
    );
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    const { showSuccess } = useNotification();

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const currentToken = formData.get('current_token').toString();
        const newToken = formData.get('new_token').toString();
        const repeatNewToken = formData.get('new_token2').toString();

        if (newToken !== repeatNewToken) {
            setError('non-matching-tokens');
            return;
        }

        const { publicKey: oldPublicKey } = await generateEndpointKeyPair(currentToken);
        const { publicKey: newPublicKey } = await generateEndpointKeyPair(newToken);

        const newDomainBody: OwnerChangeTokenRequestBody = {
            newOwnerToken: newPublicKey,
            oldOwnerToken: oldPublicKey
        };

        const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/owner/change-token`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(newDomainBody)
        });

        const result: OwnerChangeTokenResult = await response.json();
        if (response.ok) {
        } else if ('errorCode' in result) {
            switch (result.errorCode) {
                case 1: {
                    setError('error');
                    break;
                }
                case 2: {
                    setError('invalid-token');
                    break;
                }
                case 3: {
                    setError('error');
                    break;
                }
            }
            setIsLoading(false);

            return;
        }

        context.closeAll();
        router.push('/owner/sign-in');
        showSuccess('Owner token changed successfuly');
        setIsLoading(false);
    }

    return (
        <FormContainer mih={0} pos="relative">
            <LoadingOverlay visible={isLoading} />
            <FormContainer.LeftPanel />
            <FormContainer.RightPanel>
                <Stack h="100%">
                    <form
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 1
                        }}
                        onSubmit={handleSubmit}>
                        <Group gap={4} align="center" mt="md">
                            <ThemeIcon variant="transparent" size={'sm'}>
                                <IconKey />
                            </ThemeIcon>
                            <Title order={3}>Zmień Token Ownera</Title>
                        </Group>
                        <Space h="lg" mb="xl" />
                        <Stack py="md" gap="xs">
                            <PasswordInput
                                error={error === 'invalid-token' && 'Invalid Owner token'}
                                label="Akutalny token ownera"
                                name="current_token"
                            />
                            <PasswordInput
                                label="Nowy token ownera"
                                name="new_token"
                                error={error === 'non-matching-tokens' && 'Tokens are not the same'}
                            />
                            <PasswordInput
                                label="Powtórz token ownera"
                                name="new_token2"
                                error={error === 'non-matching-tokens' && 'Tokens are not the same'}
                            />

                            {error === 'error' && (
                                <Alert
                                    color="red"
                                    icon={<IconExclamationCircle />}
                                    title={'Something went wrong'}
                                />
                            )}
                        </Stack>
                        <Space h="lg" my="xl" />
                        <Group justify="center" mt="auto">
                            <Button type="submit">Zmień token ownera</Button>
                            <Button
                                onClick={() => context.closeModal(id)}
                                type="button"
                                variant="outline">
                                Anuluj
                            </Button>
                        </Group>
                    </form>
                </Stack>
            </FormContainer.RightPanel>
        </FormContainer>
    );
}
