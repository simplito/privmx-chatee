'use server';

import {
    NewDomainRequestBody,
    generateNewDomainResponse,
    newDomainRequestBodySchema
} from '@domains/logic';
import { verifySession } from '@/shared/utils/auth';
import { API_ERRORS } from '@/shared/utils/errors';
import { Domain, getDomainByName, registerNewDomain } from '@domains/data';

export async function createDomainUseCase(newDomain: NewDomainRequestBody) {
    try {
        const session = await verifySession();
        if (!session) {
            return API_ERRORS.UNAUTHORIZED;
        }

        const validation = newDomainRequestBodySchema.safeParse(newDomain);

        if (validation.success === false) {
            console.error(validation.error.flatten());

            return API_ERRORS.BAD_REQUEST;
        }
        const { domainName, domainDisplayName, domainActiveTo } = validation.data;

        const domainAlreadyExists = await getDomainByName(domainName);

        if (domainAlreadyExists) {
            return API_ERRORS.DOMAIN_IN_USE;
        }

        const inviteToken = await registerNewDomain(domainName, domainDisplayName, domainActiveTo);

        return generateNewDomainResponse(inviteToken);
    } catch (error) {
        console.log(error);
        return API_ERRORS.UNEXPECTED;
    }
}

// Dodaj nowy okres, dezaktywuj pozostałe

export async function isDomainBlocked(
    domainName: string
): Promise<{ blocked: true; reason: string; code: 1 | 2 } | { blocked: false }> {
    const domain = await getDomainByName(domainName);

    if (domain.isBlocked) {
        return { blocked: true, reason: 'Blocked by admin', code: 1 };
    }

    const activePeriods = getDomainActivePeriods(domain);

    if (activePeriods.length === 0) {
        return { blocked: true, reason: 'No active access period', code: 2 };
    }

    return { blocked: false };
}
function getDomainActivePeriods(domain: Domain): Domain['accessPeriods'] {
    return domain.accessPeriods.filter(
        (period) =>
            period.active && period.endTimestamp > Date.now() && period.startTimestamp < Date.now()
    );
}
