'use server';

import { getInviteTokenByValue } from '@/lib/db/invite-tokens/inviteTokens';
import { validateInviteToken } from '@/lib/db/invite-tokens/utils';
import { generateSignUpResponse, signUpRequestSchema } from '.';
import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/db/transactions/sign-up';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = signUpRequestSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: 'Bad request' }, { status: 400 });
        }
        const { inviteToken, publicKey, username } = validation.data;
        const token = await getInviteTokenByValue(inviteToken);
        const isTokenValid = validateInviteToken(token);

        if (!isTokenValid || !token) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 400 });
        }

        const domain = token.domain;

        await registerUser(username, publicKey, token.isStaff, domain, token.value);

        return NextResponse.json(generateSignUpResponse(), {
            status: 201
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
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
