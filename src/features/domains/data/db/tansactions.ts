'use server';
import { createInviteToken } from '@/lib/db/invite-tokens/inviteTokens';
import clientPromise from '@/lib/db/mongodb';
import { createDomain } from '@domains/data';
import { createCloudContext } from '../endpoint/contexts';

export async function registerNewDomain(
    domainName: string,
    domainDisplayName: string,
    domainActiveTo: number
) {
    const client = await clientPromise;
    const session = client.startSession();
    session.startTransaction();
    try {
        const contextId = await createCloudContext(domainName);
        await createDomain(
            domainName,
            domainDisplayName,
            domainActiveTo,
            Date.now(),
            contextId,
            session
        );
        const inviteToken = await createInviteToken(true, domainName, session);

        await session.commitTransaction();

        return inviteToken;
    } catch (e) {
        console.error('Error during createNewDomainTransaction:', e);
        await session.abortTransaction();

        throw new Error('Error during createNewDomainTransaction');
    } finally {
        await session.endSession();
    }
}
