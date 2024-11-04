import { CONTEXT_ID, BRIDGE_URL, SOLUTION_ID } from '@/shared/utils/env';
import { HandlerResponse } from '@/shared/utils/types';
import { z } from 'zod';
import { POST } from './route';

export const signInRequestSchema = z.object({
    username: z.string(),
    sign: z.string()
});

export type SignInRequestBody = z.infer<typeof signInRequestSchema>;

export function generateSignInResponse(token: string, isStaff: boolean) {
    return {
        isStaff,
        token,
        cloudData: {
            solutionId: SOLUTION_ID,
            contextId: CONTEXT_ID,
            platformUrl: BRIDGE_URL
        }
    };
}

export type SignInResponse = ReturnType<typeof generateSignInResponse>;
export type SignInResult = HandlerResponse<Awaited<ReturnType<typeof POST>>>;
