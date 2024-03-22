import { InviteToken } from '@/lib/db/invite-tokens/inviteTokens';
import { z } from 'zod';

export const InviteTokenRequestSchema = z.object({
    isStaff: z.boolean()
});

export type InviteTokenRequestBody = z.infer<typeof InviteTokenRequestSchema>;

export function generateInviteTokenRespose(inviteToken: InviteToken) {
    return {
        ...inviteToken
    };
}

export type InviteTokenResponse = ReturnType<typeof generateInviteTokenRespose>;
