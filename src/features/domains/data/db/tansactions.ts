'use server';
import { createInviteToken } from '@/lib/db/invite-tokens/inviteTokens';
import clientPromise from '@/lib/db/mongodb';
import { createDomain } from '@domains/data';
import { createCloudContext } from '../endpoint/contexts';
import crypto from 'crypto';

export async function registerNewDomain(
    domainName: string,
    domainDisplayName: string,
    domainActiveTo?: number
) {
    const client = await clientPromise;
    const session = client.startSession();
    session.startTransaction();
    try {
        const contextId = await createCloudContext(domainName);
        const id = crypto.randomBytes(16).toString('hex');

        const firstAccessPeriod = domainActiveTo
            ? {
                  id,
                  active: true,
                  endTimestamp: domainActiveTo,
                  startTimestamp: Date.now()
              }
            : undefined;

        await createDomain({
            name: domainName,
            displayName: domainDisplayName,
            contextId: contextId,
            session,
            firstAccessPeriod
        });
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
