import { Box, Center, Text } from '@mantine/core';
import { useTranslations } from 'next-intl';

export function DomainCloudStatsNoData() {
    const t = useTranslations();

    return (
        <Box p={'lg'}>
            <Center h="100%" w="100%">
                <Text c="black" fw="bolder" size="xl">
                    {t('owner.cloudStats.noData')}
                </Text>
            </Center>
        </Box>
    );
}
