import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // defaults to auto
export async function GET() {
    return NextResponse.json({ status: 'OK' }, { status: 200 });
}

export const OPTIONS = async () => {
    return NextResponse.json(
        {},
        {
            status: 200
        }
    );
};
