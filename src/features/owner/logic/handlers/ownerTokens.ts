'use server';
import { API_ERRORS } from '@utils/errors';
import {
    createOwnerTokenRequestSchema,
    generateCreateOwnerTokenResponse,
    generateOwnerChangeTokenResponse,
    ownerChangeTokenRequestSchema
} from './schemas';
import { changeOwnerToken, createNewOwnerToken, getAllActiveTokens } from '@owner/data';
import { deleteSession } from '@utils/auth';

export async function changOwnerTokenHandler(body: Record<any, unknown>) {
    const validationResult = ownerChangeTokenRequestSchema.safeParse(body);
    if (!validationResult.success) {
        return API_ERRORS.BAD_REQUEST;
    }
    const { newOwnerToken, oldOwnerToken } = validationResult.data;

    try {
        const activeOwnerTokens = await getAllActiveTokens();
        const isTokenValid = activeOwnerTokens.find((token) => token.token === oldOwnerToken);

        if (!isTokenValid) {
            return API_ERRORS.INVALID_OWNER_TOKEN;
        }

        await changeOwnerToken(newOwnerToken, oldOwnerToken);

        deleteSession();

        return generateOwnerChangeTokenResponse();
    } catch (e) {
        console.error(e);
        return API_ERRORS.UNEXPECTED;
    }
}

export async function createOwnerTokenHandler(body: Record<any, unknown>) {
    try {
        const ownerTokens = await getAllActiveTokens();

        if (ownerTokens.length > 0) {
            return API_ERRORS.BAD_REQUEST;
        }

        const validationResult = createOwnerTokenRequestSchema.safeParse(body);

        if (!validationResult.success) {
            return API_ERRORS.BAD_REQUEST;
        }

        const { ownerToken } = validationResult.data;

        await createNewOwnerToken(ownerToken);

        return generateCreateOwnerTokenResponse();
    } catch (error) {
        console.error(error);
        return API_ERRORS.UNEXPECTED;
    }
}
