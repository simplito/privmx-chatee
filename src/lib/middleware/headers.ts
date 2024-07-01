import { NextURL } from 'next/dist/server/web/next-url';
import { NextResponse } from 'next/server';

export const handleAPICorsHeaders = (url: NextURL, origin: string) => {
    if (url.pathname.startsWith('/api/')) {
        const response = NextResponse.next();
        if (origin) {
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }
        return response;
    }

    return null;
};
