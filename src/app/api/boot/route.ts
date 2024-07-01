import { hashPassword } from '@/shared/utils/crypto';
import { NextResponse } from 'next/server';
import * as crypto from 'crypto';
import { createNewOwnerToken, getAllActiveTokens } from '@owner/data';

export async function GET() {
    try {
        const tokens = await getAllActiveTokens();

        if (tokens.length === 0) {
            const firstToken = crypto.randomBytes(16).toString('hex');
            const [salt, password] = await hashPassword(firstToken);
            await createNewOwnerToken(`${salt}.${password}`);
            return NextResponse.json({ token: firstToken });
        }
        return NextResponse.json({ token: '' });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ token: '' });
    }
}

export const OPTIONS = async () => {
    return NextResponse.json(
        {},
        {
            status: 200
        }
    );
};

export const dynamic = 'force-dynamic';
