'use server';

import { deletePeriod } from '@domains/data';
import { verifySession } from '@/shared/utils/auth';
import { API_ERRORS } from '@/shared/utils/errors';
import { FORM_STATUS } from '@/shared/utils/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const requestSchema = z.object({
    id: z.string(),
    name: z.string()
});

export async function deleteActivePeriod(formData: FormData) {
    const session = verifySession();
    if (!session) {
        return API_ERRORS.UNAUTHORIZED;
    }

    const result = requestSchema.safeParse(Object.fromEntries(formData.entries()));

    if (result.success === false) {
        console.error('error', result.error.flatten().fieldErrors);
        return FORM_STATUS.ERROR;
    }

    const { id, name } = result.data;

    try {
        await deletePeriod(name, id);
        revalidatePath(`/owner/${name}`, 'layout');
        return {
            status: 'OK'
        };
    } catch (error) {
        console.error(error);
        return API_ERRORS.UNEXPECTED;
    }
}
