import { Sheet } from '@atoms/sheet/Sheet';
import { getCloudStats } from '@owner/data/cloud/stats';
import { DomainCloudStatsNoData } from './DomainCloudStatsNoData';
import { DomainCloudStatsTable } from './DomainCloudStatsTable';

export async function DomainCloudStats({ domainName }: { domainName: string }) {
    const data = await getCloudStats(domainName);

    return (
        <Sheet p="lg" pos={'relative'}>
            {!data || data.result.count === 0 ? (
                <DomainCloudStatsNoData />
            ) : (
                <DomainCloudStatsTable bucket={data.result.list[0]} />
            )}
        </Sheet>
    );
}
