import { useRef, useEffect } from 'react';

export function useInitialFocus() {
    const tokenInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        tokenInput.current?.focus();
    }, []);

    return tokenInput;
}
