import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

const locales: string[] = ['pl', 'en'];

export default getRequestConfig(async ({ locale }) => {
    if (!locales.includes(locale as any)) notFound();

    return {
        messages: (await import(`../translations/${locale}.json`)).default
    };
});
