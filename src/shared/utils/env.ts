export const REPLICA_SET = process.env.REPLICA_SET as string;
export const MONGODB_URI = process.env.MONGODB_URI as string;
export const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL as string;

export const API_URL = (
    process.env.BRIDGE_URL?.endsWith('/')
        ? `${process.env.BRIDGE_URL}api`
        : `${process.env.BRIDGE_URL}/api`
) as string;

export const BRIDGE_URL = process.env.BRIDGE_URL as string;

export const SOLUTION_ID = process.env.SOLUTION_ID as string;
export const CONTEXT_ID = process.env.CONTEXT_ID as string;

export const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID as string;
export const ACCESS_KEY_SECRET = process.env.ACCESS_KEY_SECRET as string;

export const JWT_SALT = process.env.JWT_SALT as string;

export function isDevEnv() {
    return process.env.NODE_ENV === 'development';
}

export function isProdEnv() {
    return process.env.NODE_ENV === 'production';
}
