'use server';
import { createInviteToken } from '@/lib/db/invite-tokens/inviteTokens';
import { API_ERRORS } from '@/shared/utils/errors';
import { verifyJwt } from '@utils/jwt';
import { InviteTokenRequestSchema } from './schemas';

export async function getInviteTokenHandler(sessionToken: string, body: Record<string, unknown>) {
    const validation = InviteTokenRequestSchema.safeParse(body);
    if (!validation.success) {
        return API_ERRORS.BAD_REQUEST;
    }

    if (!sessionToken) {
        return API_ERRORS.UNAUTHORIZED;
    }
    const decryptedToken = verifyJwt(sessionToken);

    if (!decryptedToken || !decryptedToken.isStaff) {
        return API_ERRORS.UNAUTHORIZED;
    }

    const inviteToken = await createInviteToken(validation.data.isStaff);
    return inviteToken;
}
