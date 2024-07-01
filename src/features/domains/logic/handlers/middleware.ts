'use server';
import { NEXT_PUBLIC_BACKEND_URL, OWNER_TOKEN, isProdEnv } from '@/shared/utils/env';
import { DomainsResponse } from '@domains/logic';
import { NextURL } from 'next/dist/server/web/next-url';
import { NextRequest } from 'next/server';

export const handleSubDomainRedirect = async (request: NextRequest, url: NextURL) => {
    const host = request.headers.get('host');
    const subdomain = getValidSubdomain(host);

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
                return true;
            }
        } catch (e) {
            console.error(e);
        }
    }

    return false;
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
