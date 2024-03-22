import { WithId } from 'mongodb';
import { InviteToken } from './inviteTokens';
import crypto from 'crypto';

function generateRandomString(length: number): string {
    const buf = crypto.randomBytes(length);
    const hexString = buf.toString('hex');
    return hexString.slice(0, length);
}

export function generateInviteToken(isStaff: boolean, domain: string): InviteToken {
    const randomValues = [
        generateRandomString(4),
        generateRandomString(4),
        generateRandomString(4)
    ];
    const tokenValue = randomValues.join('-');

    return {
        value: tokenValue,
        creationDate: Date.now(),
        isStaff,
        isUsed: false,
        domain
    };
}

export function validateInviteToken(token: InviteToken | WithId<InviteToken> | null) {
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
