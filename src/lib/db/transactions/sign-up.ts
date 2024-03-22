'use server';

import { addUserToContext } from '@/lib/endpoint-api/utils';
import { getContextIdByDomainName } from '../domains/domains';
import { expireInviteToken } from '../invite-tokens/inviteTokens';
import clientPromise from '../mongodb';
import { createUser } from '../users/users';

export async function registerUser(
    username: string,
    publicKey: string,
    isStaff: boolean,
    domain: string,
    tokenValue: string
) {
    const client = await clientPromise;
    const session = client.startSession();
    session.startTransaction();
    try {
        await createUser(
            {
                username,
                publicKey,
                isStaff
            },
            domain,
            session
        );
        const contextId = await getContextIdByDomainName(domain, session);
        await expireInviteToken(tokenValue, session);
        await addUserToContext(username, publicKey, contextId);

        await session.commitTransaction();
    } catch (e) {
        console.error('Error during createrUserTransaction:', e);
        await session.abortTransaction();

        throw new Error('Error during createUserTransaction');
    } finally {
        await session.endSession();
    }
}
