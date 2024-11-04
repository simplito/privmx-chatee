'use client';

import { Button } from '@mantine/core';

export default function GlobalError({
    reset
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div>
                    <h2>GLOBAL ERROR - Something went wrong!</h2>
                    <Button onClick={() => reset()}>Try again</Button>
                </div>
            </body>
        </html>
    );
}
