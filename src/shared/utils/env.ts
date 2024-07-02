export const MONGODB_URI = process.env.MONGODB_URI as string;
export const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL as string;
export const CLOUD_URL = process.env.CLOUD_URL as string;
export const CLOUD_DEV_TOKEN = process.env.CLOUD_DEV_TOKEN as string;
export const SOLUTION_ID = process.env.SOLUTION_ID as string;
export const PLATFORM_URL = process.env.PLATFORM_URL as string;
export const OWNER_TOKEN = process.env.OWNER_TOKEN as string;
export const JWT_SALT = process.env.JWT_SALT as string;
export const REPLICA_SET = process.env.REPLICA_SET as string;
export const INSTANCE_ID = process.env.INSTANCE_ID as string;
export const ACCESS_KEY = process.env.ACCESS_KEY as string;
export const ACCESS_KEY_SECRET = process.env.ACCESS_KEY_SECRET as string;

export function isDevEnv() {
    return process.env.NODE_ENV === 'development';
}

export function isProdEnv() {
    return process.env.NODE_ENV === 'production';
}
