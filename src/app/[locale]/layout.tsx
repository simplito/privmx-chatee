import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ColorSchemeScript } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './global.css';
import Script from 'next/script';
import { AppStyleProvider } from '@/shared/pages/app-style-provider/AppStyleProvider';
import { NextIntlClientProvider, useMessages } from 'next-intl';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Chatee',
    description: 'E2E encrypted messages and files exchange'
};

export default function LocaleLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const messages = useMessages();

    return (
        <html lang={locale}>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <ColorSchemeScript />
                <Script src="/wasmAssets/privmx-endpoint-web.js"></Script>
                <Script src="/wasmAssets/driver-web-context.js"></Script>
                <Script src="/wasmAssets/endpoint-wasm-module.js"></Script>
            </head>
            <body className={inter.className} style={{ padding: 0 }}>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <AppStyleProvider>{children}</AppStyleProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
