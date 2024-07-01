import { useTranslations } from 'next-intl';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const FORM_STATUS = {
    DEFAULT: 'default',
    LOADING: 'loading',
    ERROR: 'error',
    SUCCESS: 'success'
} as const;

// export type FormStatus = 'default' | 'loading' | 'error' | 'success';
export type FormStatus = (typeof FORM_STATUS)[keyof typeof FORM_STATUS];

export type HandlerResponse<Handler> = Handler extends NextResponse<infer R> ? R : never;

export type FormFields<T> = T extends z.ZodObject<infer R> ? R : T;
export type FormErrors<Schema> = Partial<Record<keyof FormFields<Schema>, string[]>>;

export function translateZodErrors(
    fieldErros: Partial<Record<string, string[]>>,
    t: ReturnType<typeof useTranslations>
) {
    const newFieldErrors = { ...fieldErros };
    const translatedErrors = Object.entries(fieldErros).map(([key, vals]) => {
        return [key, vals.map((val) => t(val as any))] as const;
    });

    for (const [key, value] of translatedErrors) {
        newFieldErrors[key] = value;
    }

    return newFieldErrors;
}
