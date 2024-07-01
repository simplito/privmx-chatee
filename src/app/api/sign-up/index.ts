import { HandlerResponse } from '@/shared/utils/types';
import { z } from 'zod';
import { POST } from './route';

export const signUpRequestSchema = z.object({
    inviteToken: z.string(),
    username: z.string(),
    publicKey: z.string()
});

export type SignUpRequestBody = z.infer<typeof signUpRequestSchema>;

export function generateSignUpResponse() {
    return {
        message: 'User signed up successfully'
    };
}

export type SignUpResponse = ReturnType<typeof generateSignUpResponse>;
export type SignUpResult = HandlerResponse<Awaited<ReturnType<typeof POST>>>;
