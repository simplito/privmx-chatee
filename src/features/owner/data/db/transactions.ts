'use server';

import clientPromise from '@/lib/db/mongodb';
import { createNewOwnerToken, updateOwnerToken } from './ownerToken';

export async function changeOwnerToken(newToken: string, oldToken: string) {
    const client = await clientPromise;
    const session = client.startSession();
    session.startTransaction();
    try {
        await createNewOwnerToken(newToken, session);
        await updateOwnerToken(oldToken, true, session);

        await session.commitTransaction();
    } catch (e) {
        console.error('Error during createNewDomainTransaction:', e);
        await session.abortTransaction();

        throw new Error('Error during createNewDomainTransaction');
    } finally {
        await session.endSession();
    }
}
