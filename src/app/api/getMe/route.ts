import { getTokenFromRequest } from '@/shared/utils/auth';
import { verifyJwt } from '@/shared/utils/jwt';
import { generateGetMeResponse } from '.';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // defaults to auto
export async function GET(request: Request) {
    const token = getTokenFromRequest(request);

    if (!token) {
        return NextResponse.json({ message: 'Bad request' }, { status: 400 });
    }

    const verifiedToken = verifyJwt(token);

    if (verifiedToken) {
        return NextResponse.json(generateGetMeResponse(verifiedToken), { status: 200 });
    }

    return NextResponse.json({ message: 'Invalid token' }, { status: 400 });
}

export const OPTIONS = async () => {
    return NextResponse.json(
        {},
        {
            status: 200
        }
    );
};
