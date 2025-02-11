'use server';

import { addUserToContext } from '@/lib/endpoint-api/utils';
import { expireInviteToken } from '../invite-tokens/inviteTokens';
import { createUser } from '../users/users';
import { CONTEXT_ID } from '@utils/env';
import { connectToDatabase } from '@lib/db/mongodb';

export async function registerUser(
    username: string,
    publicKey: string,
    isStaff: boolean,
    tokenValue: string
) {
    const client = await connectToDatabase()
    const session = client.startSession();
    session.startTransaction();
    try {
        await createUser(
            {
                username,
                publicKey,
                isStaff
            },
            session
        );

        await expireInviteToken(tokenValue, session);
        await addUserToContext(username, publicKey, CONTEXT_ID);

        await session.commitTransaction();
    } catch (e) {
        await session.abortTransaction();
        throw e;
    } finally {
        await session.endSession();
    }
}
