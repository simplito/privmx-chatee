'use client';

import { MenuItem } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useTranslations } from 'next-intl';

export function DomainBlockButton({
    domainToBlock,
    domainName
}: {
    domainName: string;
    domainToBlock: string;
}) {
    function handleDomainBlock() {
        modals.openContextModal({
            modal: 'confirmDomainBlockModal',
            innerProps: {
                domainName,
                domainToBlock
            }
        });
    }

    const t = useTranslations();

    return <MenuItem onClick={handleDomainBlock}>{t('owner.domain.header.blockDomain')}</MenuItem>;
}
