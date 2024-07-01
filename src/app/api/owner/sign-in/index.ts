import { z } from 'zod';
import { POST } from './route';
import { HandlerResponse } from '@/shared/utils/types';

export const ownerSignInRequestSchema = z.object({
    date: z.string(),
    signature: z.string()
});

export type OwnerSignInRequestBody = z.infer<typeof ownerSignInRequestSchema>;

export function generateOwnerSignInResponse() {
    return { response: 'ok' };
}

export type OwnerSignInResponse = ReturnType<typeof generateOwnerSignInResponse>;

export type OwnerSignInResult = HandlerResponse<Awaited<ReturnType<typeof POST>>>;
