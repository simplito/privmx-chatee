import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ColorSchemeScript } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import './global.css';
import Script from 'next/script';
import { Providers } from '@pages/app-style-provider/Providers';
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
                <Script src="/wasm-assets/privmx-endpoint-web.js"></Script>
                <Script src="/wasm-assets/driver-web-context.js"></Script>
                <Script src="/wasm-assets/endpoint-wasm-module.js"></Script>
            </head>
            <body className={inter.className} style={{ padding: 0 }}>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <Providers>{children}</Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
