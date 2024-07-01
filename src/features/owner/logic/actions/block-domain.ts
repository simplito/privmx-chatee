'use server';

import { updateBlockDomain } from '@domains/data';
import { FORM_STATUS, FormStatus } from '@/shared/utils/types';
import { revalidatePath } from 'next/cache';

export async function blockDomainAction(data: FormData) {
    const isBlocked = data.get('isBlocked').toString() === 'true';
    const domainName = data.get('domain').toString();

    try {
        await updateBlockDomain(domainName, isBlocked);
    } catch (error) {
        console.error(error);
    }

    revalidatePath('/owner');
}

export async function blockDomainFormStateAction(
    prevData: { status: FormStatus },
    data: FormData
): Promise<{ status: FormStatus }> {
    const isBlocked = data.get('isBlocked').toString() === 'true';
    const domainName = data.get('domain').toString();

    try {
        await updateBlockDomain(domainName, isBlocked);
        revalidatePath('/owner');
        return {
            status: FORM_STATUS.SUCCESS
        };
    } catch (error) {
        console.error(error);
        return {
            status: FORM_STATUS.ERROR
        };
    }
}
