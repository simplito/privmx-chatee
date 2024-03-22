'use server';

import { createJwt } from '@/shared/utils/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { generateSignInResponse, signInRequestSchema } from '.';
import { EccCrypto } from '@/shared/utils/crypto';
import { getContextIdByDomainName } from '@/lib/db/domains/domains';
import { getUserByUsernameAndDomain } from '@/lib/db/users/users';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validationResult = signInRequestSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({ message: 'Bad request' }, { status: 400 });
        }
        const { username, domainName, sign } = validationResult.data;

        const user = await getUserByUsernameAndDomain(username, domainName);

        if (!user) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
        }

        const isValid = EccCrypto.verifySignature(
            user.publicKey,
            Buffer.from(sign, 'hex'),
            Buffer.from(username)
        );

        if (!isValid) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
        }

        const token = createJwt({
            username: user.username,
            isStaff: user.isStaff,
            domain: domainName
        });

        const contextId = await getContextIdByDomainName(domainName);

        return NextResponse.json(generateSignInResponse(token, contextId, user.isStaff), {
            status: 200
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
