import { Sheet } from '@/shared/ui/atoms/sheet/Sheet';
import { Button, Group, Space, Text, Title } from '@mantine/core';
import { HeaderMenu } from './header-menu/HeaderMenu';
import { useUserContext } from '@/shared/ui/context/UserContext';
import { getDomainClient } from '@/shared/utils/domain';
import { IconDoamin } from '@icon';
import { openContextModal } from '@mantine/modals';

export function Navbar() {
    const {
        state: { username, isStaff }
    } = useUserContext();

    const currentDomain = getDomainClient();

    return (
        <Sheet m="md" radius={'md'} pl="lg" pr="sm" h="calc(100% - 16px)">
            <Group h="100%" justify="space-between">
                <Title order={3}>Chatee</Title>
                <Group>
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
                    <Group gap={'xs'}>
                        <Text size="sm">{username ? username : 'user'}</Text>
                        <HeaderMenu />
                    </Group>
                </Group>
            </Group>
        </Sheet>
    );
}
