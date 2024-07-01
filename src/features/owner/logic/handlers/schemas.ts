import { z } from 'zod';
import { changOwnerTokenHandler, createOwnerTokenHandler } from './ownerTokens';

export const ownerChangeTokenRequestSchema = z.object({
    oldOwnerToken: z.string(),
    newOwnerToken: z.string()
});

export type OwnerChangeTokenRequestBody = z.infer<typeof ownerChangeTokenRequestSchema>;

export function generateOwnerChangeTokenResponse() {
    return { result: 'ok' };
}

export type OwnerChangeTokenResponse = ReturnType<typeof generateOwnerChangeTokenResponse>;

// export type OwnerChangeTokenResult = HandlerResponse<Awaited<ReturnType<typeof POST>>>;
export type OwnerChangeTokenResult = Awaited<ReturnType<typeof changOwnerTokenHandler>>;

export const createOwnerTokenRequestSchema = z.object({
    ownerToken: z.string()
});

export type CreateOwnerTokenRequestBody = z.infer<typeof createOwnerTokenRequestSchema>;

export function generateCreateOwnerTokenResponse() {
    return { result: 'ok' };
}

export type CreateOwnerTokenResponse = ReturnType<typeof generateCreateOwnerTokenResponse>;

export type CreateOwnerTokenResult = Awaited<ReturnType<typeof createOwnerTokenHandler>>;
