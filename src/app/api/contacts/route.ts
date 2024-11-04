import { getUserContacts } from '@/lib/db/users/users';
import { getTokenFromRequest } from '@/shared/utils/auth';
import { verifyJwt } from '@/shared/utils/jwt';
import { NextResponse } from 'next/server';
import { generateContactsResponse } from '.';
import { API_ERRORS } from '@utils/errors';

export const dynamic = 'force-dynamic'; // defaults to auto
export async function GET(request: Request) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json(API_ERRORS.UNAUTHORIZED, { status: 401 });
        }

        const userData = verifyJwt(token);

        if (!userData) {
            return NextResponse.json(API_ERRORS.UNAUTHORIZED, { status: 401 });
        }

        const contactsWithId = await getUserContacts(userData.isStaff);

        const contactsWithoutId = contactsWithId.map((user) => {
            // eslint-disable-next-line no-unused-vars
            const { _id, ...userWithoutId } = user;
            return userWithoutId;
        });

        return NextResponse.json(generateContactsResponse(contactsWithoutId), {
            status: 200
        });
    } catch {
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
