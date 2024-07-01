'use client';
export function getLocalCookieVal() {
    if (!window.document) {
        return '';
    }

    const name = encodeURIComponent('NEXT_LOCALE') + '=';
    const decodedCookie = decodeURIComponent(window.document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1); // Trim leading whitespace
        if (c.indexOf(name) === 0) return c.substring(name.length, c.length); // If the cookie is found, return its value
    }
    return '';
}
