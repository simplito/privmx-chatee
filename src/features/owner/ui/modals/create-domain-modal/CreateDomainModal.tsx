'use client';
import {
    Stack,
    TextInput,
    Group,
    ThemeIcon,
    Title,
    InputLabel,
    Button,
    Box,
    Input,
    Space,
    Alert,
    LoadingOverlay
} from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';

import { FormContainer } from '@atoms/form-container';
import { IconExclamationCircle, IconHomePlus } from '@tabler/icons-react';
import { SyntheticEvent, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { NewDomainRequestBody, createDomainUseCase } from '@domains/logic';
import { DateInput } from '@mantine/dates';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { DomainUrl } from '../../page/domains/DomainUrl';
export interface threadUsers {
    userId: string;
    publicKey: string;
    isAdmin: boolean;
}

const formDataSchema = z.object({
    name: z
        .string()
        .min(3, { message: 'error.minLength3' })
        .max(40, { message: 'error.maxLength40' }),
    domain: z
        .string()
        .regex(/^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)$/, {
            message: 'owner.newDomain.errors.invalidDomain'
        })
        .min(3, { message: 'error.minLength3' })
        .max(20, { message: 'error.maxLength20' }),
    activeTo: z
        .string()
        .datetime({ message: 'owner.newDomain.errors.invalidDateTime' })
        .transform((val) => new Date(val).valueOf())
});

type FormFields<T> = T extends z.ZodObject<infer R> ? R : never;

function translateZodErrors(
    fieldErros: Partial<Record<string, string[]>>,
    t: ReturnType<typeof useTranslations>
) {
    const newFieldErrors = { ...fieldErros };
    const translatedErrors = Object.entries(fieldErros).map(([key, vals]) => {
        return [key, vals.map((val) => t(val as any))] as const;
    });

    for (const [key, value] of translatedErrors) {
        newFieldErrors[key] = value;
    }

    return newFieldErrors;
}

export function CreateDomainModal({
    context,
    id
}: // eslint-disable-next-line no-unused-vars
ContextModalProps<{}>) {
    const [error, setError] = useState<null | string>(null);
    const [isLoading, startTransition] = useTransition();

    const [fieldErrors, setFieldErrors] =
        useState<Partial<Record<keyof FormFields<typeof formDataSchema>, string[]>>>();
    const router = useRouter();
    const t = useTranslations();

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = Object.fromEntries(
            new FormData(e.currentTarget as HTMLFormElement).entries()
        );

        const parseResult = formDataSchema.safeParse(formData);

        if (parseResult.success === false) {
            setFieldErrors(translateZodErrors(parseResult.error.flatten().fieldErrors, t));
            return;
        }

        const newDomainBody: NewDomainRequestBody = {
            domainDisplayName: parseResult.data.name,
            domainName: parseResult.data.domain,
            domainActiveTo: parseResult.data.activeTo
        };

        startTransition(async () => {
            const result = await createDomainUseCase(newDomainBody);

            if ('errorCode' in result) {
                switch (result.errorCode) {
                    case 1: {
                        setError(result.message);
                        break;
                    }
                    case 3: {
                        setError(result.message);
                        break;
                    }
                    case 200: {
                        setError(result.message);
                        break;
                    }
                }
                return;
            }

            router.refresh();

            context.openContextModal('createDomainSuccessModal', {
                innerProps: { invitationToken: result.value },
                onClose() {
                    context.closeAll();
                }
            });
        });
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
                                <IconHomePlus />
                            </ThemeIcon>
                            <Title order={3}>{t('owner.createDomain.title')}</Title>
                        </Group>
                        <Space h="lg" mb="xl" />
                        <Stack py="md" gap="xs">
                            <TextInput
                                label={t('owner.createDomain.name')}
                                name="name"
                                error={fieldErrors?.name && fieldErrors.name}
                            />
                            <Group gap={0} align="flex-top">
                                <TextInput
                                    flex={1}
                                    label={t('owner.createDomain.domain')}
                                    name="domain"
                                    error={fieldErrors?.domain && fieldErrors.domain}
                                    styles={{
                                        input: {
                                            borderTopRightRadius: 0,
                                            borderBottomRightRadius: 0,
                                            borderRight: 0
                                        }
                                    }}
                                />
                                <Box>
                                    <InputLabel />
                                    <Input
                                        component="div"
                                        w="auto"
                                        variant="filled"
                                        styles={{
                                            input: {
                                                borderTopLeftRadius: 0,
                                                borderBottomLeftRadius: 0
                                            }
                                        }}>
                                        <DomainUrl span></DomainUrl>
                                    </Input>
                                </Box>
                            </Group>
                            <DateInput
                                error={fieldErrors?.activeTo && fieldErrors.activeTo}
                                name="activeTo"
                                minDate={new Date()}
                                label={t('owner.createDomain.activeTo')}
                            />
                            {error && (
                                <Alert color="red" icon={<IconExclamationCircle />} title={error} />
                            )}
                        </Stack>
                        <Space h="lg" my="xl" />
                        <Group justify="center" mt="auto">
                            <Button type="submit">{t('owner.createDomain.submit')}</Button>
                            <Button
                                onClick={() => context.closeModal(id)}
                                type="button"
                                variant="outline">
                                {t('common.cancel')}
                            </Button>
                        </Group>
                    </form>
                </Stack>
            </FormContainer.RightPanel>
        </FormContainer>
    );
}
