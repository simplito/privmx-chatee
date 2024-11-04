import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { handleAPICorsHeaders } from './lib/middleware/headers';

const PUBLIC_FILE = /\.(.*)$/; // Files

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const origin = request.headers.get('origin');

    if (PUBLIC_FILE.test(url.pathname) || url.pathname.includes('_next')) {
        return NextResponse.rewrite(url);
    }

    const apiHostHeaders = handleAPICorsHeaders(url, origin);

    if (apiHostHeaders) {
        return apiHostHeaders;
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
