import { PLATFORM_URL, SERVER_ID } from '@/shared/utils/env';
import { z } from 'zod';

export const signInRequestSchema = z.object({
    domainName: z.string(),
    username: z.string(),
    sign: z.string()
});

export type SignInRequestBody = z.infer<typeof signInRequestSchema>;

export function generateSignInResponse(token: string, contextId: string, isStaff: boolean) {
    return {
        isStaff,
        token,
        cloudData: {
            solutionId: SERVER_ID,
            contextId,
            platformUrl: PLATFORM_URL
        }
    };
}

export type SignInResponse = ReturnType<typeof generateSignInResponse>;
