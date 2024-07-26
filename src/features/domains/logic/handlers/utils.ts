import { InviteTokenClientDTO } from '@/lib/db/invite-tokens/inviteTokens';
import { z } from 'zod';

export async function generateDomainsResponse(domains: string[]) {
    return { domains };
}

export type DomainsResponse = Awaited<ReturnType<typeof generateDomainsResponse>>;

export const InviteTokenRequestSchema = z.object({
    isStaff: z.boolean()
});

export type InviteTokenRequestBody = z.infer<typeof InviteTokenRequestSchema>;

export function generateInviteTokenRespose(inviteToken: InviteTokenClientDTO) {
    return {
        ...inviteToken
    };
}

export type InviteTokenResponse = ReturnType<typeof generateInviteTokenRespose>;

export type NewDomainRequestBody = z.infer<typeof newDomainRequestBodySchema>;

export function generateNewDomainResponse(inviteToken: InviteTokenClientDTO) {
    return {
        ...inviteToken
    };
}

export type NewDomainResponse = ReturnType<typeof generateNewDomainResponse>;

export const newDomainRequestBodySchema = z.object({
    domainName: z.string().min(3).max(30),
    domainDisplayName: z.string().min(3).max(30),
    domainActiveTo: z
        .number()
        .min(0)
        .refine(
            (val) => {
                return !isNaN(new Date(val).getTime());
            },
            { message: 'domainActiveTo Must be valid date timestamp' }
        )
        .refine(
            (val) => {
                return val >= Date.now();
            },
            { message: 'domainActiveTo date Must be in the future' }
        )
        .or(z.undefined())
});
