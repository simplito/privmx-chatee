import useContactsGet from '@/lib/hooks/useContactsGet';
import { useInviteToken } from '@/lib/hooks/useInviteToken';
import { useSetStaff } from '@/lib/hooks/useSetStaff';
import { IconDoamin } from '@icon';
import {
    Group,
    Paper,
    Stack,
    TextInput,
    Title,
    Text,
    Loader,
    Center,
    CopyButton,
    rem,
    Divider,
    Button,
    Switch,
    Box,
    ThemeIcon,
    ActionIcon,
    Menu,
    Badge,
    Tooltip,
    ScrollArea
} from '@mantine/core';
import { useInputState } from '@mantine/hooks';
import {
    IconCheck,
    IconCopy,
    IconPlus,
    IconSearch,
    IconSettings,
    IconUser,
    IconUserPlus,
    IconX
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { ContextModalProps } from '@mantine/modals';
import { FormContainer } from '@atoms/form-container';
import { useUserContext } from '@/shared/ui/context/UserContext';
import { UserAvatar } from '@atoms/user-avatar/UserAvatar';

export function DomainConfigModal({ context, id }: ContextModalProps<{}>) {
    return (
        <FormContainer>
            <ActionIcon
                variant="subtle"
                pos="absolute"
                top={16}
                right={16}
                onClick={() => context.closeModal(id)}>
                <IconX size={16} />
            </ActionIcon>
            <FormContainer.LeftPanel></FormContainer.LeftPanel>
            <FormContainer.RightPanel>
                <DomainConfig />
            </FormContainer.RightPanel>
        </FormContainer>
    );
}
function DomainConfig() {
    const [query, setQuery] = useInputState('');
    const t = useTranslations();

    return (
        <Stack gap={'lg'}>
            <Group gap={4} align="center" mt={'lg'}>
                <ThemeIcon variant="transparent" size={'sm'}>
                    <IconDoamin />
                </ThemeIcon>
                <Title order={3}>{t('chat.modals.domainModal.domain')}</Title>
            </Group>
            <Divider />
            <InviteForm />
            <Divider />
            <Stack
                gap={'sm'}
                flex={1}
                style={{
                    overflowY: 'auto'
                }}>
                <Group gap={4}>
                    <ThemeIcon variant="transparent" size={'sm'}>
                        <IconUser />
                    </ThemeIcon>
                    <Title order={4}>{t('chat.modals.domainModal.members')}</Title>
                </Group>

                <Group gap="sm">
                    <TextInput
                        value={query}
                        onChange={setQuery}
                        leftSection={<IconSearch size={16} />}
                        placeholder={t('common.search')}
                        size="xs"
                        flex={1}
                    />
                </Group>
                <ScrollArea.Autosize mah={300}>
                    <UsersList query={query} />
                </ScrollArea.Autosize>
            </Stack>
        </Stack>
    );
}

function UsersList({ query }: { query: string }) {
    const { contacts, status, setContacts } = useContactsGet();
    const { handleSetStaff } = useSetStaff();
    const {
        state: { username }
    } = useUserContext();

    const t = useTranslations();

    if (status === 'loading') {
        return (
            <Stack gap={0}>
                <Center flex={1}>
                    <Loader />
                </Center>
            </Stack>
        );
    }

    const filteredContacts = contacts.filter((contact) =>
        contact.username.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <Stack gap={0}>
            {filteredContacts.map((contact) => (
                <Paper
                    radius={0}
                    key={contact.publicKey}
                    p="xs"
                    style={{
                        borderBottom: 'var(--mantine-border)'
                    }}>
                    <Group w="100%" justify="space-between">
                        <Group gap="xs" align="baseline">
                            <UserAvatar name={contact.username} />
                            <Text size="sm" ta={'left'} c="dimmed">
                                {contact.username}
                            </Text>
                            {contact.isStaff ? (
                                <Badge size="xs" variant="outline">
                                    Staff
                                </Badge>
                            ) : null}
                        </Group>
                        {contact.username !== username && (
                            <Menu shadow="md" position="bottom-end">
                                <Menu.Target>
                                    <ActionIcon variant="light" color="gray">
                                        <IconSettings />
                                    </ActionIcon>
                                </Menu.Target>

                                <Menu.Dropdown>
                                    <Menu.Item
                                        color={contact.isStaff ? 'red' : undefined}
                                        onClick={() =>
                                            handleSetStaff(
                                                contact.username,
                                                !contact.isStaff,
                                                setContacts
                                            )
                                        }>
                                        <Text size="sm">
                                            {contact.isStaff
                                                ? t('chat.modals.domainModal.revokeAdminPrivileges')
                                                : t('chat.modals.domainModal.grantAdminPrivileges')}
                                        </Text>
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        )}
                    </Group>
                </Paper>
            ))}
        </Stack>
    );
}

function InviteForm() {
    const {
        handleGetInviteToken,
        status: inviteTokenStatus,
        inviteToken,
        clearInviteToken
    } = useInviteToken();

    const t = useTranslations();

    return (
        <form
            onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const isAdmin = formData.get('isAdmin')?.toString() === 'on' ? true : false;
                await handleGetInviteToken(isAdmin);
            }}>
            <Stack gap={'md'}>
                <Box>
                    <Group gap={4}>
                        <ThemeIcon variant="transparent" size={'sm'}>
                            <IconUserPlus />
                        </ThemeIcon>
                        <Title order={4}>{t('chat.modals.domainModal.inviteNewMember')}</Title>
                    </Group>
                    <Text size="sm" c="dimmed">
                        {t('chat.modals.domainModal.inviteNewMemberSubTitle')}
                    </Text>
                </Box>

                <Stack gap="xs">
                    <Group gap={8} w="100%" align="flex-end">
                        <Button
                            leftSection={<IconPlus size="1rem" />}
                            type="submit"
                            size="xs"
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
                            size="xs"
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
                                    <ActionIcon variant="light" h={30} w={30} onClick={copy}>
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
                        size="xs"
                        label={t('chat.modals.domainModal.userWithAdminPrivileges')}
                        name="isAdmin"
                    />
                </Stack>
            </Stack>
        </form>
    );
}
