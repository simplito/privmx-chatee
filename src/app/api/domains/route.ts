import { NextResponse } from 'next/server';
import { getDomainsHandler } from '@domains/logic';
import { API_ERRORS } from '@/shared/utils/errors';

export const dynamic = 'force-dynamic'; // defaults to auto
export async function GET() {
    try {
        const result = await getDomainsHandler();
        if ('errorCode' in result) {
            switch (result.errorCode) {
                case 5:
                    return NextResponse.json(result, { status: 400 });
            }
        }
        return NextResponse.json(result, { status: 200 });
    } catch {
        return NextResponse.json(API_ERRORS.UNEXPECTED, { status: 500 });
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
