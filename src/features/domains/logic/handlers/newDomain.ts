'use server';
import { API_ERRORS } from '@/shared/utils/errors';
import { getDomainByName, registerNewDomain } from '@domains/data';
import { verifySession } from '@utils/auth';
import { generateNewDomainResponse, newDomainRequestBodySchema } from './utils';

export async function newDomainHandler(body: Record<any, unknown>) {
    const session = await verifySession();
    if (!session) {
        return API_ERRORS.UNAUTHORIZED;
    }

    const validation = newDomainRequestBodySchema.safeParse(body);
    if (!validation.success) {
        return API_ERRORS.BAD_REQUEST;
    }
    const { domainName, domainDisplayName, domainActiveTo } = validation.data;

    const domainAlreadyExists = await getDomainByName(domainName);

    if (domainAlreadyExists) {
        return API_ERRORS.DOMAIN_IN_USE;
    }

    const inviteToken = await registerNewDomain(domainName, domainDisplayName, domainActiveTo);

    return generateNewDomainResponse(inviteToken);
}
