import { Sheet } from '@/shared/ui/atoms/sheet/Sheet';
import { ActionIcon, Box, Button, Flex, Group, Menu, Space, Text, Title } from '@mantine/core';
import { HeaderMenu } from './header-menu/HeaderMenu';
import { useUserContext } from '@/shared/ui/context/UserContext';
import { getDomainClient } from '@/shared/utils/domain';
import { IconDoamin } from '@icon';
import { openContextModal } from '@mantine/modals';
import { IconMenu2 } from '@tabler/icons-react';
import { MobileHeaderMenu } from './header-menu/MobileHeaderMenu';
import { useMediaQuery } from '@mantine/hooks';
import { useEmitEvent } from '@srs/ReactBindings';
import { UserEvent } from '@srs/AppBus';

export function Navbar({ toggle }: { toggle: VoidFunction }) {
    const {
        state: { username, isStaff }
    } = useUserContext();

    const currentDomain = getDomainClient();
    const isMobile = useMediaQuery(`(max-width: 62em)`);

    const emit = useEmitEvent();

    const dispatchLogoutEvent = async () => {
        emit(UserEvent.signOut());
    };

    return (
        <Sheet m="md" radius={'md'} pl="lg" pr="sm" h="calc(100% - 16px)">
            <Flex h="100%" align={'center'}>
                <Box w="100%" hiddenFrom="md">
                    <ActionIcon variant="subtle" onClick={() => toggle()}>
                        <IconMenu2 size={24} />
                    </ActionIcon>
                </Box>
                <Box w="100%">
                    <Title ta={isMobile ? 'center' : 'left'} order={3}>
                        Chatee
                    </Title>
                </Box>
                <Box w="100%">
                    <Group justify="flex-end" visibleFrom="md">
                        {isStaff && (
                            <Button
                                onClick={() => {
                                    openContextModal({
                                        modal: 'domainModal',
                                        innerProps: {
                                            size: 'xl'
                                        }
                                    });
                                }}
                                leftSection={<IconDoamin size="1rem" />}
                                variant="outline"
                                size="xs">
                                {currentDomain}
                            </Button>
                        )}
                        <Space />
                        {username && (
                            <Group gap={'xs'}>
                                <Text size="sm">{username}</Text>
                                <HeaderMenu onLogOut={dispatchLogoutEvent} />
                            </Group>
                        )}
                    </Group>
                    <Group justify="flex-end">
                        <MobileHeaderMenu onLogOut={dispatchLogoutEvent}>
                            {isStaff && (
                                <Menu.Item
                                    leftSection={<IconDoamin size="1rem" />}
                                    onClick={() => {
                                        openContextModal({
                                            modal: 'domainModal',
                                            innerProps: {
                                                size: 'xl'
                                            }
                                        });
                                    }}>
                                    {currentDomain}
                                </Menu.Item>
                            )}
                        </MobileHeaderMenu>
                    </Group>
                </Box>
            </Flex>
        </Sheet>
    );
}
