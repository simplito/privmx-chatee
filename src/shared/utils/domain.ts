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

export function getInstanceDomain(hostname: string) {
    if (!hostname || process.env.NODE_ENV === 'development') {
        return 'local.com';
    }

    const location = window.location.hostname.split('.');
    if (location.length === 3) {
        location.shift();
    }

    return location.join('.');
}
