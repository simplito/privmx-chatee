import { PLATFORM_URL, SOLUTION_ID } from '@/shared/utils/env';
import { HandlerResponse } from '@/shared/utils/types';
import { z } from 'zod';
import { POST } from './route';

export const signInRequestSchema = z.object({
    domainName: z.string(),
    username: z.string(),
    sign: z.string()
});

export type SignInRequestBody = z.infer<typeof signInRequestSchema>;

export function generateSignInResponse(
    token: string,
    contextId: string,
    isStaff: boolean,
    periodEndDate?: number
) {
    return {
        isStaff,
        token,
        cloudData: {
            solutionId: SOLUTION_ID,
            contextId,
            platformUrl: PLATFORM_URL
        },
        periodEndDate: periodEndDate
    };
}

export type SignInResponse = ReturnType<typeof generateSignInResponse>;
export type SignInResult = HandlerResponse<Awaited<ReturnType<typeof POST>>>;
