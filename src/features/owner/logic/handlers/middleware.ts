'use server';
import { decryptCookie } from '@utils/jwt';
import { NextURL } from 'next/dist/server/web/next-url';

const protectedRoutes = ['/owner'];

export const handleOwnerRedirect = async (url: NextURL, cookie: string) => {
    const isProtected =
        url.pathname !== '/owner/sign-in' &&
        url.pathname !== '/owner/create-token' &&
        protectedRoutes.findIndex((x) => url.pathname.startsWith(x)) !== -1;

    if (isProtected) {
        const session = await decryptCookie(cookie);

        if (!session) {
            return true;
        }
    }

    return false;
};
