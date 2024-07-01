'use server';

import { FORM_STATUS, FormErrors, FormStatus } from '@/shared/utils/types';
import { addNewAccessPeriod } from '@domains/logic';
import { revalidatePath } from 'next/cache';
import { RedirectType, redirect } from 'next/navigation';
import { z } from 'zod';

const newPeriodSchema = z.object({
    domainName: z.string().min(3).max(50),
    range: z
        .string()
        .transform((string) => {
            const splited = string.split(' – ');
            return splited;
        })
        .refine((dates) => dates.length === 2, { message: 'Invalid tuple' })
        .transform((tuple) => [new Date(tuple[0]), new Date(tuple[1])] as [Date, Date])
});

export async function addActivePeriodAction(
    prevData: { status: FormStatus },

    formData: FormData
): Promise<
    { status: FormStatus } | { status: 'field-error'; errors: FormErrors<typeof newPeriodSchema> }
> {
    const entries = Object.fromEntries(formData.entries());

    const result = newPeriodSchema.safeParse(entries);

    if (result.success === false) {
        return { status: 'field-error', errors: result.error.flatten().fieldErrors };
    }

    const { domainName, range } = result.data;

    const response = await addNewAccessPeriod(domainName, range[0].valueOf(), range[1].valueOf());

    if ('errorCode' in response) {
        switch (response.errorCode) {
            case 1:
                return {
                    status: FORM_STATUS.ERROR
                };
            case 5:
                redirect('/owner/sign-in', RedirectType.push);
                return {
                    status: FORM_STATUS.ERROR
                };
            case 202:
                return {
                    status: FORM_STATUS.ERROR
                };
            case 203:
                return {
                    status: 'field-error',
                    errors: { range: ['Newer access period already exists'] }
                };
        }
    }

    revalidatePath(`/owner/${domainName}`);
    return {
        status: FORM_STATUS.SUCCESS
    };
}
