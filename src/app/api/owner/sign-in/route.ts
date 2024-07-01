'use server';

import { NextRequest, NextResponse } from 'next/server';
import { generateOwnerSignInResponse, ownerSignInRequestSchema } from '.';
import { API_ERRORS } from '@/shared/utils/errors';
import { createSession } from '@/shared/utils/auth';
import { EccCrypto } from '@/shared/utils/crypto';
import { getAllActiveTokens } from '@owner/data';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validationResult = ownerSignInRequestSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(API_ERRORS.BAD_REQUEST, { status: 400 });
        }
        const { date, signature } = validationResult.data;
        const timeDifference = new Date(date).getTime() - Date.now();

        const fiveMinutesInMilliseconds = 5 * 60 * 1000;

        if (timeDifference > fiveMinutesInMilliseconds) {
            return NextResponse.json(API_ERRORS.EXPIRED_NONCE, { status: 400 });
        }
        const activeOwnerTokens = await getAllActiveTokens();
        let isValid = false;

        for (const token of activeOwnerTokens) {
            isValid = EccCrypto.verifySignature(
                token.token,
                Buffer.from(signature, 'hex'),
                Buffer.from(date)
            );

            if (isValid) {
                break;
            }
        }

        if (!isValid) {
            return NextResponse.json(API_ERRORS.INVALID_CREDENTIALS, { status: 400 });
        }

        await createSession();

        return NextResponse.json(generateOwnerSignInResponse(), {
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
