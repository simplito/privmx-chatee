'use server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { NEXT_PUBLIC_BACKEND_URL } from './shared/utils/env';
import createIntlMiddleware from 'next-intl/middleware';
import { cookies } from 'next/headers';
import { handleAPICorsHeaders } from './lib/middleware/headers';
import { handleOwnerRedirect } from '@owner/logic/handlers/middleware';
import { handleSubDomainRedirect } from '@domains/logic/handlers/middleware';

const PUBLIC_FILE = /\.(.*)$/; // Files

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const origin = request.headers.get('origin');
    const sessionCookie = cookies().get('session')?.value;

    const ownerRedirect = await handleOwnerRedirect(url, sessionCookie);

    if (ownerRedirect) {
        return NextResponse.redirect(new URL('/owner/sign-in', request.nextUrl));
    }

    if (PUBLIC_FILE.test(url.pathname) || url.pathname.includes('_next')) {
        return NextResponse.rewrite(url);
    }

    const apiHostHeaders = handleAPICorsHeaders(url, origin);

    if (apiHostHeaders) {
        return apiHostHeaders;
    }

    const subdomainRedirect = await handleSubDomainRedirect(request, url);

    if (subdomainRedirect) {
        return NextResponse.redirect(`${NEXT_PUBLIC_BACKEND_URL}/domain-not-found`);
    }

    const handleI18nRouting = createIntlMiddleware({
        locales: ['en', 'pl'],
        defaultLocale: 'pl',
        localePrefix: 'never'
    });

    const response = handleI18nRouting(request);
    response.headers.set('Access-Control-Allow-Origin', origin);
    return response;
}

export const config = {
    matcher: ['/', '/(pl|en)/:path*', '/((?!_next/static|_next/image|favicon.ico).*)']
};
