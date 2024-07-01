import { Stack, Title, Text, Table, TableTbody, TableTr, TableTd } from '@mantine/core';
import { Bucket } from '@owner/data/cloud/stats';
import { bytesSize } from '@utils/units';
import { useTranslations } from 'next-intl';

export function DomainCloudStatsTable({ bucket }: { bucket: Bucket }) {
    const t = useTranslations();

    return (
        <Stack gap="md">
            <Title order={4} ml={'xs'}>
                {t('owner.cloudStats.header')}
            </Title>
            <Table>
                <TableTbody>
                    <TableTr>
                        <TableTd>
                            <Text>{t('owner.cloudStats.requests')}:</Text>
                        </TableTd>
                        <TableTd>
                            <Text>{bucket.requests}</Text>
                        </TableTd>
                    </TableTr>
                    <TableTr>
                        <TableTd>
                            <Text>{t('owner.cloudStats.erros')}:</Text>
                        </TableTd>
                        <TableTd>
                            <Text>{bucket.errors}</Text>
                        </TableTd>
                    </TableTr>
                    <TableTr>
                        <TableTd>
                            <Text>{t('owner.cloudStats.totalTime')}:</Text>
                        </TableTd>
                        <TableTd>
                            <Text>{bucket.executionTime.toFixed(2)} ms</Text>
                        </TableTd>
                    </TableTr>
                    <TableTr>
                        <TableTd>
                            <Text>{t('owner.cloudStats.dataReceived')}:</Text>
                        </TableTd>
                        <TableTd>
                            <Text>{bytesSize(bucket.inTraffic)}</Text>
                        </TableTd>
                    </TableTr>
                    <TableTr>
                        <TableTd>
                            <Text>{t('owner.cloudStats.dataSent')}:</Text>
                        </TableTd>
                        <TableTd>
                            <Text>{bytesSize(bucket.outTraffic)}</Text>
                        </TableTd>
                    </TableTr>
                    <TableTr>
                        <TableTd>
                            <Text>{t('owner.cloudStats.minTime')}:</Text>
                        </TableTd>
                        <TableTd>
                            <Text>{bucket.minTime.toFixed(2)} ms</Text>
                        </TableTd>
                    </TableTr>
                    <TableTr>
                        <TableTd>
                            <Text>{t('owner.cloudStats.maxTime')}:</Text>
                        </TableTd>
                        <TableTd>
                            <Text>{bucket.maxTime.toFixed(2)} ms</Text>
                        </TableTd>
                    </TableTr>
                </TableTbody>
            </Table>
        </Stack>
    );
}
