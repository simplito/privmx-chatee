import {
    Grid,
    Stack,
    TextInput,
    Paper,
    ScrollArea,
    Group,
    Button,
    Checkbox,
    LoadingOverlay,
    Alert,
    Text,
    ActionIcon,
    ThemeIcon,
    Title
} from '@mantine/core';
import { ContextModalProps, modals } from '@mantine/modals';
import { SelectableUser } from './SelectableUser';
import { useEffect } from 'react';
import useContactsGet from '@/lib/hooks/useContactsGet';
import { useTranslations } from 'next-intl';
import { IconMessagePlus, IconUser, IconX } from '@tabler/icons-react';
import { useInputState } from '@mantine/hooks';
import { ThreadUsers, useThreadCreate } from '@chat/logic';
import { useUserContext } from '@/shared/ui/context/UserContext';
import { FormContainer } from '@atoms/form-container';
import { LoadingState } from '@atoms/loading-state/LoadingState';
import { SearchInput } from '@atoms/search-input/SearchInput';

import { Chat } from '@chat/logic/chat-system/types';

export function CreateChatModal({
    context,
    id,
    innerProps
}: ContextModalProps<{ navigate: (chat: Chat) => void }>) {
    const { contacts, status } = useContactsGet();
    const { createThread, status: threadStatus } = useThreadCreate();
    const {
        state: { username }
    } = useUserContext();

    const t = useTranslations();
    useEffect(() => {
        if (threadStatus === 'success') {
            modals.close(id);
        }
    }, [threadStatus, id]);

    const [usersQuery, changeUsersQuerry] = useInputState('');

    return (
        <FormContainer>
            <ActionIcon
                variant="subtle"
                style={{ zIndex: 10 }}
                pos="absolute"
                top={16}
                right={16}
                onClick={() => context.closeModal(id)}>
                <IconX size={16} />
            </ActionIcon>
            <LoadingOverlay
                visible={threadStatus === 'loading'}
                loaderProps={{
                    children: <LoadingState title={t('chat.modals.createChatModal.loading')} />
                }}
            />
            <FormContainer.LeftPanel></FormContainer.LeftPanel>
            <FormContainer.RightPanel>
                <Stack h="100%">
                    <form
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 1
                        }}
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target as HTMLFormElement);
                            const name = formData.get('name')?.toString() as string;

                            const selectedCheckboxes: ThreadUsers[] = [];

                            const entries = Array.from(formData.entries());
                            for (const pair of entries) {
                                const [name, value] = pair;
                                if (formData.getAll(name).length > 0 && name === 'users') {
                                    const data: ThreadUsers = JSON.parse(value.toString());
                                    selectedCheckboxes.push(data);
                                }
                            }

                            if (name && selectedCheckboxes.length >= 1) {
                                const newThreadInfo = await createThread(selectedCheckboxes, name);
                                if (newThreadInfo) innerProps.navigate(newThreadInfo);
                            }
                        }}>
                        <Group gap={4} align="center" mt="md">
                            <ThemeIcon variant="transparent" size={'sm'}>
                                <IconMessagePlus />
                            </ThemeIcon>
                            <Title order={3}>New Chat</Title>
                        </Group>
                        <TextInput
                            data-autofocus
                            mb="lg"
                            name="name"
                            placeholder={t('chat.modals.createChatModal.chatNamePlaceholder')}
                            withAsterisk
                            size="lg"
                            required
                            styles={{
                                input: {
                                    border: 0,
                                    borderBottom: 'var(--mantine-border)',
                                    borderRadius: 0,
                                    padding: 'var(--mantine-spacing-sm)',
                                    paddingInline: 'var(--mantine-spacing-xs)'
                                }
                            }}
                        />

                        <Paper mb="sm" pos="relative" h="100%" w="100%">
                            <LoadingOverlay visible={status === 'loading'} />
                            {status === 'success' &&
                                contacts.length === 0 &&
                                t('chat.modals.createChatModal.noContacts')}

                            {status === 'success' && contacts.length > 0 && (
                                <Checkbox.Group>
                                    <Group gap={4} pr={'md'} pb={'xs'}>
                                        <ThemeIcon variant="transparent" size={'sm'}>
                                            <IconUser />
                                        </ThemeIcon>
                                        <Text fw="bold" size="sm">
                                            {t('chat.modals.createChatModal.members')}
                                        </Text>
                                    </Group>
                                    <SearchInput
                                        mb="sm"
                                        onChange={changeUsersQuerry}
                                        value={usersQuery}
                                        size="xs"
                                        style={{
                                            flexGrow: 1
                                        }}
                                    />
                                    <ScrollArea.Autosize mah={350} scrollbars="y">
                                        <Stack gap={'xs'} pos="relative">
                                            <Grid w="100%" align="center">
                                                {contacts
                                                    .filter(
                                                        (user) =>
                                                            user.username != username &&
                                                            user.username
                                                                .toLocaleLowerCase()
                                                                .includes(
                                                                    usersQuery.toLocaleLowerCase()
                                                                )
                                                    )
                                                    .map((person) => {
                                                        return (
                                                            <SelectableUser
                                                                name="users"
                                                                key={person.username}
                                                                person={person}
                                                            />
                                                        );
                                                    })}
                                            </Grid>
                                        </Stack>
                                    </ScrollArea.Autosize>
                                </Checkbox.Group>
                            )}

                            {status === 'error' && (
                                <Alert
                                    title={t('common.error') + '!'}
                                    color="red"
                                    style={{ margin: 'auto 0' }}>
                                    {t('chat.modals.createChatModal.errors.errorLoadingContacts')}
                                </Alert>
                            )}
                        </Paper>
                        <Group grow style={{ marginTop: 'auto' }}>
                            <Button type="submit" disabled={threadStatus === 'loading'}>
                                {t('common.save')}
                            </Button>
                            <Button variant="light" onClick={() => context.closeModal(id)}>
                                {t('common.cancel')}
                            </Button>
                        </Group>
                    </form>
                </Stack>
            </FormContainer.RightPanel>
        </FormContainer>
    );
}
