'use server';
import { getDomainUsersCount } from '@/lib/db/users/users';
import { DomainSummaryView } from '.';

export async function DomainSummary({ domain }: { domain: string }) {
    const userCount = await getDomainUsersCount(domain);

    return <DomainSummaryView usersCount={userCount} />;
}
