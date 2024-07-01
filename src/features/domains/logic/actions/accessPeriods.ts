'use server';
import { API_ERRORS } from '@/shared/utils/errors';
import { getDomainByName, addPeriod, setPeriodBlockStatus } from '@domains/data';
import { verifySession } from '@utils/auth';

export async function addNewAccessPeriod(domainName: string, startDate: number, endDate: number) {
    if (startDate >= endDate) {
        return API_ERRORS.BAD_REQUEST;
    }

    const session = await verifySession();
    if (!session) {
        return API_ERRORS.UNAUTHORIZED;
    }

    const domain = await getDomainByName(domainName);

    if (!domain) {
        return API_ERRORS.INVALID_DOMAIN;
    }

    const hasNewerPeriod = domain.accessPeriods.find(
        (period) => period.active && period.endTimestamp > endDate
    );

    if (hasNewerPeriod) {
        console.error('Newer period already exist');
        return API_ERRORS.INVALID_PERIOD;
    }

    const newPeriod = {
        active: true,
        endTimestamp: endDate,
        startTimestamp: startDate
    };

    await addPeriod(domainName, newPeriod);

    return newPeriod;
}

export async function setAccessPeriod(domainName: string, periodId: string, isActive: boolean) {
    const session = await verifySession();
    if (!session) {
        return API_ERRORS.UNAUTHORIZED;
    }

    const domain = await getDomainByName(domainName);

    if (!domain) {
        return API_ERRORS.INVALID_DOMAIN;
    }

    const res = await setPeriodBlockStatus(domain.name, periodId, isActive);
    return res;
}
