import { InviteTokenClientDTO } from '@/lib/db/invite-tokens/inviteTokens';
import { z } from 'zod';

export const InviteTokenRequestSchema = z.object({
    isStaff: z.boolean()
});

export type InviteTokenRequestBody = z.infer<typeof InviteTokenRequestSchema>;

export function generateInviteTokenResponse(inviteToken: InviteTokenClientDTO) {
    return {
        ...inviteToken
    };
}

export type InviteTokenResponse = ReturnType<typeof generateInviteTokenResponse>;
