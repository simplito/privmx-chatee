import { Grid, GridCol, Skeleton, Stack, Title } from '@mantine/core';
import { cookies } from 'next/headers';
import { decryptCookie } from '@/shared/utils/jwt';
import { Suspense } from 'react';
import { getDomainByName } from '@domains/data';
import {
    ActivePeriods,
    DomainCloudStats,
    DomainHeader,
    DomainSummary,
    DomainSummaryLoader,
    OwnerPanelNavbar
} from '@owner/ui';

export default async function DomainPage({ params }: { params: { domain: string } }) {
    const cookie = cookies().get('session')?.value;
    const session = await decryptCookie(cookie);

    if (!session) {
        <></>;
    }
    // eslint-disable-next-line no-unused-vars
    const { _id, ...domain } = await getDomainByName(params.domain);

    if (!domain) {
        return <Title>No domain</Title>;
    }

    return (
        <>
            <OwnerPanelNavbar />
            <Stack
                flex={1}
                p="lg"
                maw={1500}
                w="100%"
                mx="auto"
                mt="md"
                pos={'relative'}
                style={{ zIndex: 5 }}>
                <DomainHeader domain={domain} />
                <Grid flex={1} align="stretch">
                    <GridCol span={{ xs: 12, lg: 4 }} flex={1}>
                        <Suspense fallback={<DomainSummaryLoader />}>
                            <DomainSummary domain={domain.name} />
                        </Suspense>
                    </GridCol>

                    <GridCol span={{ xs: 12, lg: 8 }}>
                        <Stack gap={'lg'}>
                            <ActivePeriods domain={domain} />
                            <Suspense fallback={<Skeleton h={50} w={100} />}>
                                <DomainCloudStats domainName={domain.name} />
                            </Suspense>
                        </Stack>
                    </GridCol>
                </Grid>
            </Stack>
        </>
    );
}
