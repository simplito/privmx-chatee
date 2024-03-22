'use server';

import { NextResponse } from 'next/server';
import { generateSetStaffResponse, setStaffRequestBodySchema } from '.';
import { getTokenFromRequest } from '@/shared/utils/auth';
import { verifyJwt } from '@/shared/utils/jwt';
import { setUserStaffRole } from '@/lib/db/users/users';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = setStaffRequestBodySchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: 'Bad request' }, { status: 400 });
        }

        const token = getTokenFromRequest(request);

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const validatedToken = verifyJwt(token);

        if (!validatedToken?.isStaff) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { username, isStaff } = validation.data;

        const count = await setUserStaffRole(username, isStaff);

        if (!count) {
            return NextResponse.json({ message: 'Failed to update users role' }, { status: 500 });
        }

        return NextResponse.json(generateSetStaffResponse(), { status: 200 });
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
