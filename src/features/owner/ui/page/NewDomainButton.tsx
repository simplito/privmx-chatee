'use client';

import { Button } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { IconPlus } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

export function NewDomainButton() {
    const t = useTranslations();
    return (
        <Button
            onClick={() => {
                openContextModal({
                    modal: 'createDomainModal',
                    innerProps: {}
                });
            }}
            leftSection={<IconPlus size={'1rem'} />}>
            {t('owner.newDomain.newDomainButton')}
        </Button>
    );
}
