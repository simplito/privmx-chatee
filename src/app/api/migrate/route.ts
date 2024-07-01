import { getDomains, updateDomainDisplayName, updateDomainsAcceess } from '@domains/data';
import { getAllInviteTokens, mutateInviteToken } from '@/lib/db/invite-tokens/inviteTokens';
import { hashPassword } from '@/shared/utils/crypto';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const MONTH_TIME = 30 * 24 * 60 * 60 * 1000;

export async function POST() {
    const inviteTokens = await getAllInviteTokens();

    //hash invite tokens
    for (const token of inviteTokens) {
        if (token.value) {
            console.log(`[SERVER]: MIGRATING TOKEN: ${token.value}`);

            const hassedPassword = hashPassword(token.value).join('.');

            await mutateInviteToken(
                { value: token.value },
                {
                    creationDate: token.creationDate,
                    domain: token.domain,
                    hashedValue: hassedPassword,
                    isStaff: token.isStaff,
                    isUsed: token.isUsed
                }
            );
        }
    }

    const domains = await getDomains();

    for (const domain of domains) {
        if (!domain.displayName) {
            console.log(`[SERVER]: MIGRATING DOMAIN DISPLAY NAME: ${domain.name}`);
            console.log(await updateDomainDisplayName(domain.name, domain.name));
        }
        if (!domain?.accessPeriods) {
            console.log(`[SERVER]: MIGRATING DOMAIN ACCESS PERIOD: ${domain.name}`);
            const response = await updateDomainsAcceess(domain.name, {
                active: true,
                endTimestamp: Date.now() + MONTH_TIME,
                startTimestamp: Date.now(),
                id: crypto.randomBytes(16).toString('hex')
            });
            if (response.acknowledged && response.modifiedCount > 0) {
                console.log(`[SERVER]: DONE`);
            }
        }
    }

    return NextResponse.json({ msg: 'OK' }, { status: 200 });
}

export const OPTIONS = async () => {
    return NextResponse.json(
        {},
        {
            status: 200
        }
    );
};
