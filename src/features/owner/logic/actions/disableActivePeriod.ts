'use server';
import { FORM_STATUS } from '@/shared/utils/types';
import { setAccessPeriod } from '@domains/logic';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const schema = z.object({
    name: z.string(),
    id: z.string(),
    isActive: z.string().transform((string) => (string === 'true' ? true : false))
});

export async function disablePeriodAction(data: FormData) {
    const entries = Object.fromEntries(data.entries());

    const result = schema.safeParse(entries);

    if (result.success === false) {
        console.error('error', result.error.flatten().fieldErrors);
        return FORM_STATUS.ERROR;
    }

    const { id, name, isActive } = result.data;

    try {
        const result = await setAccessPeriod(name, id, isActive);
        const hasError = 'errorCode' in result;
        if (hasError) {
            switch (result.errorCode) {
                case 202:
                    throw new Error(result.message);
            }
        } else {
            revalidatePath(`/owner/${name}`, 'layout');
            return {
                status: FORM_STATUS.SUCCESS
            };
        }
    } catch (error) {
        console.error(error);
        return {
            status: FORM_STATUS.ERROR
        };
    }

    //  redirect doesn't work in try catch
    redirect('/owner/sign-in');
}
