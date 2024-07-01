import { LoadingOverlay } from '@mantine/core';
import { useFormStatus } from 'react-dom';

export function FormLoadingOverlay() {
    const { pending } = useFormStatus();

    return <LoadingOverlay visible={pending} />;
}
