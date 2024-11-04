'use server';

import { InviteTokenDbDTO, getActiveInviteTokens } from '@/lib/db/invite-tokens/inviteTokens';
import { generateSignUpResponse, signUpRequestSchema } from '.';
import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/db/transactions/sign-up';
import { CredentialError } from '@/lib/errors/credentialError';
import { validatePassword } from '@/shared/utils/crypto';
import { API_ERRORS } from '@/shared/utils/errors';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = signUpRequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(API_ERRORS.BAD_REQUEST, { status: 400 });
        }
        const { inviteToken, publicKey, username } = validation.data;

        const activeTokens = await getActiveInviteTokens();

        let isTokenValid = false;
        let correctToken: InviteTokenDbDTO;

        for (const token of activeTokens) {
            if (!token?.hashedValue) continue;
            const [salt, hash] = token.hashedValue.split('.');
            const passedTokenHash = await validatePassword(inviteToken, salt);
            isTokenValid = passedTokenHash === hash;

            if (isTokenValid) {
                correctToken = token;
                break;
            }
        }

        if (!isTokenValid || !correctToken) {
            return NextResponse.json(API_ERRORS.INVALID_TOKEN, { status: 400 });
        }

        await registerUser(username, publicKey, correctToken.isStaff, correctToken.hashedValue);

        return NextResponse.json(generateSignUpResponse(), {
            status: 201
        });
    } catch (e) {
        console.error(e);
        if (e instanceof CredentialError) {
            return NextResponse.json(API_ERRORS.USER_IN_USE, { status: 400 });
        }

        return NextResponse.json(API_ERRORS.UNEXPECTED, { status: 500 });
    }
}

export const OPTIONS = async () => {
    return NextResponse.json(
        {},
        {
            status: 200
        }
    );
};
