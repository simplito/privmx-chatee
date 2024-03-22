import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { NEXT_PUBLIC_BACKEND_URL, OWNER_TOKEN, isProdEnv } from './shared/utils/env';
import { DomainsResponse } from './app/api/domains';
import createIntlMiddleware from 'next-intl/middleware';

const PUBLIC_FILE = /\.(.*)$/; // Files

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const origin = request.headers.get('origin');

    if (PUBLIC_FILE.test(url.pathname) || url.pathname.includes('_next')) {
        return NextResponse.rewrite(url);
    }

    if (url.pathname.startsWith('/api/')) {
        const response = NextResponse.next();
        if (origin) {
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
        return response;
    }

    const host = request.headers.get('host');
    const subdomain = getValidSubdomain(host);

    if (isProdEnv() && NEXT_PUBLIC_BACKEND_URL !== 'https://chatee.test.simplito.com') {
        if (host === NEXT_PUBLIC_BACKEND_URL.split('//')[1] && !url.pathname.startsWith('/home')) {
            return NextResponse.redirect(`${NEXT_PUBLIC_BACKEND_URL}/home`);
        }
    }

    if (subdomain && !url.pathname.startsWith('/domain-not-found') && isValidHostnameLength(host)) {
        try {
            const domainRequest = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/domains`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${OWNER_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            const { domains }: DomainsResponse = await domainRequest.json();
            const exists = domains.some((domain) => domain === subdomain);

            if (!exists) {
                return NextResponse.redirect(`${NEXT_PUBLIC_BACKEND_URL}/domain-not-found`);
            }
        } catch (e) {
            console.error(e);
        }
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

const getValidSubdomain = (host?: string | null) => {
    let subdomain: string | null = null;
    if (!host && typeof window !== 'undefined') {
        host = window.location.host;
    }
    if (host && host.includes('.')) {
        const candidate = host.split('.')[0];
        if (candidate && !candidate.includes('localhost')) {
            subdomain = candidate;
        }
    }
    return subdomain;
};

function isValidHostnameLength(host: string) {
    const parts = host.split('.');
    const minLength = isProdEnv() ? 2 : 1;
    return parts.length > minLength;
}
