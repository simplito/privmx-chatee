import { NextRequest, NextResponse } from 'next/server';
import { changOwnerTokenHandler } from '@owner/logic/handlers/ownerTokens';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const result = await changOwnerTokenHandler(body);

    if ('errorCode' in result) {
        switch (result.errorCode) {
            case 1:
                return NextResponse.json(result, { status: 400 });
            case 2:
                return NextResponse.json(result, { status: 400 });
            case 3:
                return NextResponse.json(result, { status: 500 });
            default:
                break;
        }
    }

    return NextResponse.json(result, { status: 200 });
}

export const OPTIONS = async () => {
    return NextResponse.json(
        {},
        {
            status: 200
        }
    );
};
