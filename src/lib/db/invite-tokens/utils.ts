import { WithId } from 'mongodb';
import { InviteToken, InviteTokenDbDTO } from './inviteTokens';
import crypto from 'crypto';
import { hashPassword } from '@/shared/utils/crypto';

function generateRandomString(length: number): string {
    const buf = crypto.randomBytes(length);
    const hexString = buf.toString('hex');
    return hexString.slice(0, length);
}

export async function generateInviteToken(isStaff: boolean): Promise<InviteToken> {
    const randomValues = [
        generateRandomString(4),
        generateRandomString(4),
        generateRandomString(4)
    ];
    const tokenValue = randomValues.join('-');

    const [tokenSalt, hashedToken] = await hashPassword(tokenValue);

    return {
        value: tokenValue,
        hashedValue: `${tokenSalt}.${hashedToken}`,
        creationDate: Date.now(),
        isStaff,
        isUsed: false
    };
}

export function validateInviteToken(token: InviteTokenDbDTO | WithId<InviteTokenDbDTO> | null) {
    if (!token) {
        return false;
    }

    if (token.isUsed) {
        return false;
    }

    const dateNow = Date.now();
    const creationDate = new Date(token.creationDate);

    const diffInMilliseconds = dateNow - creationDate.getTime();
    const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);
    const sevenDaysPassed = diffInDays >= 7;

    if (sevenDaysPassed) {
        return false;
    }

    return true;
}
