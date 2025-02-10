import { NextResponse } from 'next/server';
import { createFirstToken } from '@/lib/db/invite-tokens/inviteTokens';
import {
    ACCESS_KEY_ID,
    ACCESS_KEY_SECRET,
    BRIDGE_URL,
    CONTEXT_ID,
    JWT_SALT, MONGODB_URI,
    SOLUTION_ID
} from '@utils/env';

function checkEnv(name: string, env: string | undefined) {
    console.log(`[INFO] ${name} registered: ${env}`)
    if (!env) {
        console.error(`[ERROR] ${name} missing in env file`);
        return true;
    }
    return false;
}

export async function GET() {
    try {
        let incompleteEnvs;

        incompleteEnvs = checkEnv('BRIDE URL', BRIDGE_URL);
        incompleteEnvs = checkEnv('SOLUTION ID', SOLUTION_ID) || incompleteEnvs;
        incompleteEnvs = checkEnv('CONTEXT ID', CONTEXT_ID) || incompleteEnvs;

        incompleteEnvs = checkEnv('ACCESS KEY ID', ACCESS_KEY_ID) || incompleteEnvs;
        incompleteEnvs = checkEnv('ACCESS KEY SECRET', ACCESS_KEY_SECRET) || incompleteEnvs;

        incompleteEnvs = checkEnv('JWT SALT', JWT_SALT) || incompleteEnvs;
        incompleteEnvs = checkEnv('MONGO_URI', MONGODB_URI) || incompleteEnvs;


        if (incompleteEnvs) {
            console.error('[ERROR] Invalid Envs');
            process.exit(1);
        }

        await createFirstToken();
        return NextResponse.json(
            { message: 'Ok' },
            {
                status: 200
            }
        );
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
