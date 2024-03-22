export function getSubDomain(hostHeader: string | null) {
    if (!hostHeader || process.env.NODE_ENV === 'development') {
        return 'dev';
    }

    const parts = hostHeader.split('.');

    if (parts.length > 2) {
        return parts[0];
    }

    return 'default-instance';
}

export function getDomainClient() {
    if (process.env.NODE_ENV === 'development') {
        return 'test';
    }

    return window.location.hostname.split('.')[0];
}
