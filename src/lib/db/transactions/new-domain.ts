'use server';
import { createDomain } from '../domains/domains';
import { createInviteToken } from '../invite-tokens/inviteTokens';
import clientPromise from '../mongodb';

export async function registerNewDomain(domainName: string) {
    const client = await clientPromise;
    const session = client.startSession();
    session.startTransaction();
    try {
        await createDomain(domainName, session);
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
