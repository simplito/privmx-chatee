'use server';

import { createJwt } from '@/shared/utils/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { generateSignInResponse, signInRequestSchema } from '.';
import { EccCrypto } from '@/shared/utils/crypto';
import { getUserByUsername } from '@/lib/db/users/users';
import { API_ERRORS } from '@/shared/utils/errors';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validationResult = signInRequestSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(API_ERRORS.BAD_REQUEST, { status: 400 });
        }
        const { username, sign } = validationResult.data;

        const user = await getUserByUsername(username);

        if (!user) {
            return NextResponse.json(API_ERRORS.INVALID_CREDENTIALS, { status: 400 });
        }

        const isValid = EccCrypto.verifySignature(
            user.publicKey,
            Buffer.from(sign, 'hex'),
            Buffer.from(username)
        );

        if (!isValid) {
            return NextResponse.json(API_ERRORS.INVALID_CREDENTIALS, { status: 400 });
        }

        const token = createJwt({
            username: user.username,
            isStaff: user.isStaff
        });

        return NextResponse.json(generateSignInResponse(token, user.isStaff), {
            status: 200
        });
    } catch (e) {
        console.error(e);
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
