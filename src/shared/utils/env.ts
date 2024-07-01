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
export const ACCESS_TOKEN = process.env.ACCESS_TOKEN as string;

// export const MONGODB_URI = 'mongodb://mongo:27017';
// export const NEXT_PUBLIC_BACKEND_URL = 'https://chatee.test.simplito.com/';
// export const CLOUD_URL = 'https://cloud.pmxbox.com/api/client';
// export const CLOUD_DEV_TOKEN = 'F3FbaR7FD4dLzEbXFjttGJYbsiJzjaw7KtoNs2ZFg1YF';
// export const SOLUTION_ID = '65e6fe0ca780b27f021650bb';
// export const PLATFORM_URL = 'https://ee.pmxbox.com/d/YbaQ3DiS5jsVESjABpecty/';
// export const OWNER_TOKEN = 'Ll6IBWHx0vHuFbnVBoZT5v3fbuQc3uFhQ4zIERr1qNfxbAqNc5';
// export const JWT_SALT = 'nwEeGAqJKqb2RIyrpGD5a83qfOtrsZ17JJuCfhdF';
// export const SERVER_ID = '24wCjoFdBafam8SkKPpfvcQryejz';

export function isDevEnv() {
    return process.env.NODE_ENV === 'development';
}

export function isProdEnv() {
    return process.env.NODE_ENV === 'production';
}
