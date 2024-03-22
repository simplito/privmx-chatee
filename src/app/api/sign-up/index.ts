import { z } from 'zod';

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
