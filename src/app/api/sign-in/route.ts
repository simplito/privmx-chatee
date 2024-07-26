'use server';

import { createJwt } from '@/shared/utils/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { generateSignInResponse, signInRequestSchema } from '.';
import { EccCrypto } from '@/shared/utils/crypto';
import { Domain, getDomainByName } from '@domains/data';
import { getUserByUsernameAndDomain } from '@/lib/db/users/users';
import { API_ERRORS } from '@/shared/utils/errors';
import { Time } from '@/shared/utils/date';
import { isDomainBlocked } from '@domains/logic';

function getTimeToPeriodEnd(now: number, periods: Domain['accessPeriods']): number | null {
    const activePeriods = periods
        .sort((a, b) => a.startTimestamp - b.startTimestamp)
        .filter((domain) => {
            return domain.active && domain.endTimestamp > now;
        });

    // find first period that begins more than 1 day later than dateOfLastPeriodEnd
    // if arrys ends faster return Infinity

    if (activePeriods.length === 0) {
        return null;
    } else if (activePeriods.length === 1) {
        return activePeriods[0].endTimestamp;
    }

    for (let i = 0; i < activePeriods.length; i++) {
        const currentPeriod = activePeriods[i];
        const nextPeriod = activePeriods.find(
            (period) => currentPeriod.endTimestamp < period.endTimestamp
        );

        if (!nextPeriod || currentPeriod.endTimestamp + Time.day < nextPeriod.startTimestamp) {
            return currentPeriod.endTimestamp;
        }
    }

    return null;
}
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validationResult = signInRequestSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(API_ERRORS.BAD_REQUEST, { status: 403 });
        }
        const { username, domainName, sign } = validationResult.data;

        const domain = await getDomainByName(domainName);

        const accessPeriodsEnabled = domain.accessPeriods.length > 0;

        //If owner didn't created access periods ignore them
        if (accessPeriodsEnabled) {
            const blockedStatus = await isDomainBlocked(domain);

            if (blockedStatus.blocked) {
                if (blockedStatus.code === 1) {
                    return NextResponse.json(API_ERRORS.DOMAIN_BLOCKED, { status: 300 });
                } else {
                    return NextResponse.json(API_ERRORS.NO_ACCESS_PERIOD, { status: 300 });
                }
            }
        }

        const user = await getUserByUsernameAndDomain(username, domainName);

        if (!user) {
            return NextResponse.json(API_ERRORS.INVALID_CREDENTIALS, { status: 400 });
        }

        const isValid = EccCrypto.verifySignature(
            user.publicKey,
            Buffer.from(sign, 'hex'),
            Buffer.from(username)
        );

        if (!isValid) {
            return NextResponse.json(API_ERRORS.INVALID_CREDENTIALS, { status: 400 });
        }

        const token = createJwt({
            username: user.username,
            isStaff: user.isStaff,
            domain: domainName
        });

        const lastPeriodEndDate =
            user.isStaff && accessPeriodsEnabled
                ? getTimeToPeriodEnd(Date.now(), domain.accessPeriods)
                : null;

        return NextResponse.json(
            generateSignInResponse(token, domain.contextId, user.isStaff, lastPeriodEndDate),
            {
                status: 200
            }
        );
    } catch (e) {
        console.error(e);
        return NextResponse.json(API_ERRORS.UNEXPECTED, { status: 500 });
    }
}

export const OPTIONS = async () => {
    return NextResponse.json(
        {},
        {
            status: 200
        }
    );
};
