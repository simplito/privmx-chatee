import dayjs from 'dayjs';
import { useEffect } from 'react';
import { getLocalCookieVal } from './locale';

export function displayDate(date: number) {
    return dayjs(date).format('l LT');
}

export function useLocale() {
    useEffect(() => {
        dayjs.locale(getLocalCookieVal() === 'pl' ? 'pl' : 'en');
    }, []);
}
