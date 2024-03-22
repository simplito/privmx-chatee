import { InviteToken } from '@/lib/db/invite-tokens/inviteTokens';
import { z } from 'zod';

export const newDomainRequestBodySchema = z.object({
    ownerToken: z.string(),
    domainName: z.string()
});

export type NewDomainRequestBody = z.infer<typeof newDomainRequestBodySchema>;

export function generateNewDomainResponse(inviteToken: InviteToken) {
    return {
        ...inviteToken
    };
}

export type NewDomainResponse = ReturnType<typeof generateNewDomainResponse>;
