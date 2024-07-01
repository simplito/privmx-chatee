'use client';

import dayjs from 'dayjs';
import { useFormatter } from 'next-intl';
import { useState, useEffect } from 'react';
import { getLocalCookieVal } from '../utils/locale';

export function useLocaleDate() {
    const formatter = useFormatter();

    function displayDate(date: number) {
        return formatter.dateTime(date, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    return { displayDate };
}

export function useLocale() {
    const [locale, setLocale] = useState<'pl' | 'en'>('en');

    useEffect(() => {
        const cookieLocale = getLocalCookieVal() === 'pl' ? 'pl' : 'en';
        dayjs.locale(cookieLocale);
        setLocale(cookieLocale);
    }, []);

    return locale;
}
