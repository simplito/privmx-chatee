'use server';
import { API_ERRORS } from '@/shared/utils/errors';
import { getDomainNames } from '@domains/data';
import { generateDomainsResponse } from './utils';
import { verifySession } from '@utils/auth';

export async function getDomainsHandler() {
    const verified = await verifySession();

    if (!verified) {
        return API_ERRORS.UNAUTHORIZED;
    }

    const domains = await getDomainNames();

    return generateDomainsResponse(domains);
}
