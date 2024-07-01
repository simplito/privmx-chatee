'use server';

import { Domain, getDomains } from '@domains/data';
import { SimpleGrid } from '@mantine/core';
import { DomainCard } from './DomainCard';

const sortDomain = (a: Domain, b: Domain) => {
    if (a.isBlocked && b.isBlocked) {
        return 0;
    } else if (a.isBlocked && !b.isBlocked) {
        return 1;
    } else {
        return -1;
    }
};

export async function Domains() {
    const domains = await getDomains();

    return (
        <SimpleGrid cols={{ xs: 2, lg: 4 }}>
            {domains.toSorted(sortDomain).map((domain) => {
                return (
                    <DomainCard
                        key={domain.contextId}
                        domain={domain.name}
                        name={domain.displayName}
                        status={domain.isBlocked}
                    />
                );
            })}
        </SimpleGrid>
    );
}
