'use client';

import {
    ActionIcon,
    Button,
    Group,
    Menu,
    MenuDropdown,
    MenuItem,
    MenuTarget,
    Title
} from '@mantine/core';
import { IconChevronLeft, IconDotsVertical } from '@tabler/icons-react';
import Link from 'next/link';
import { DomainBlockButton } from '../DomainBlockButton';
import { Domain } from '@domains/data';
import { useTranslations } from 'next-intl';
import { blockDomainAction } from '@owner/logic';

export function DomainHeader({ domain }: { domain: Domain }) {
    const t = useTranslations();

    return (
        <>
            <Button
                component={Link}
                href={'/owner'}
                mt="xl"
                display={'inline-flex'}
                pl={0}
                variant="transparent"
                leftSection={<IconChevronLeft size={'1rem'} />}>
                {t('common.back')}
            </Button>
            <Group mb="md" justify="space-between">
                <Title order={1}>{domain.displayName}</Title>
                <Menu position="bottom-end" withinPortal={true}>
                    <MenuTarget>
                        <ActionIcon variant="subtle" size={'lg'}>
                            <IconDotsVertical />
                        </ActionIcon>
                    </MenuTarget>
                    <MenuDropdown>
                        {domain.isBlocked ? (
                            <form action={blockDomainAction}>
                                <input type="hidden" name="isBlocked" value={'false'} />
                                <input type="hidden" name="domain" value={domain.name} />
                                <MenuItem type="submit">
                                    {t('owner.domain.header.unblockDomain')}
                                </MenuItem>
                            </form>
                        ) : (
                            <DomainBlockButton
                                domainName={domain.displayName}
                                domainToBlock={domain.name}
                            />
                        )}
                    </MenuDropdown>
                </Menu>
            </Group>
        </>
    );
}
