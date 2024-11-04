import * as elliptic from 'elliptic';
import * as base58check from 'bs58check';
import * as crypto from 'crypto';
import { ACCESS_KEY_ID, ACCESS_KEY_SECRET } from './env';

export type Result<T> = { success: true; result: T } | { success: false; error: any };

export class EccCrypto {
    static verifySignature(eccPubKeyBase58: string, signature: Buffer, data: Buffer): boolean {
        return EccCrypto.verifySignatureEcc(
            EccCrypto.publicFromBase58DER(eccPubKeyBase58),
            signature,
            data
        );
    }

    static verifySignatureEcc(
        pubkey: elliptic.ec.KeyPair,
        signature: Buffer,
        data: Buffer
    ): boolean {
        if (signature.length != 65) {
            return false;
        }
        const r = signature.slice(1, 33).toString('hex');
        const s = signature.slice(33).toString('hex');
        const hash = EccCrypto.sha256(data);
        return pubkey.verify(hash.toString('hex'), { r: r, s: s });
    }

    static publicFromBase58DER(
        eccPubBase58: string,
        curve: string = 'secp256k1'
    ): elliptic.ec.KeyPair {
        const result = EccCrypto.try(() => base58check.decode(eccPubBase58));
        if (result.success === false || result.result.length === 0) {
            return null;
        }
        const ec = new elliptic.ec(curve);
        return ec.keyFromPublic(Buffer.from(result.result).toString('hex'), 'hex');
    }

    static try<T>(func: () => T): Result<T> {
        try {
            return { success: true, result: func() };
        } catch (e) {
            return { success: false, error: e };
        }
    }

    static hash(algorithm: string, data: Buffer) {
        return crypto.createHash(algorithm).update(data).digest();
    }

    static sha256(data: Buffer): Buffer {
        return EccCrypto.hash('sha256', data);
    }
}

interface ECCBase58KeyPair {
    privateKeyBase58: string;
    publicKeyHex: string;
}

export function generateECCBase58KeyPair(): ECCBase58KeyPair {
    const ec = new elliptic.ec('secp256k1');

    const keyPair = ec.genKeyPair();
    const privateKeyHex = keyPair.getPrivate('hex');
    const publicKeyHex = keyPair.getPublic('hex');

    return {
        privateKeyBase58: base58check.encode(Buffer.from(privateKeyHex, 'hex')),
        publicKeyHex
    };
}

export function signTextWithBase58PrivateKey(privateKeyBase58: string, text: string): string {
    const ec = new elliptic.ec('secp256k1');

    const privateKeyHex = Buffer.from(base58check.decode(privateKeyBase58)).toString('hex');
    const keyPair = ec.keyFromPrivate(privateKeyHex, 'hex');
    const signature = keyPair.sign(text);

    return signature.toDER('hex');
}

export function verifySignatureWithPublicKey(
    publicKeyHex: string,
    text: string,
    signatureHex: string
): boolean {
    const ec = new elliptic.ec('secp256k1');

    const keyPair = ec.keyFromPublic(publicKeyHex, 'hex');

    return keyPair.verify(text, signatureHex);
}

export function privateKeyToWIF(privateKeyHex: string, network = 'mainnet') {
    const versionByte = network === 'mainnet' ? 0x80 : 0xef;
    const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
    const versionedPrivateKey = Buffer.concat([Buffer.from([versionByte]), privateKeyBuffer]);

    const privateKeyWIF = base58check.encode(versionedPrivateKey);
    return privateKeyWIF;
}

export function verifySign(publicKey: string, data: string, signature: string) {
    const ec = new elliptic.ec('secp256k1'); // Choose your curve. secp256k1 is commonly used for Bitcoin

    const publicKeyBytes = base58check.decode(publicKey);

    const publicKeyHex = Buffer.from(publicKeyBytes).toString('hex');

    const key = ec.keyFromPublic(publicKeyHex, 'hex');

    const isVerified = key.verify(data, signature);

    return isVerified;
}

function generateSalt(length: number) {
    return crypto.randomBytes(length);
}

export function hashPassword(password: string): [salt: string, passwordHash: string] {
    const salt = generateSalt(16).toString('hex');

    const passwordHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    return [salt, passwordHash];
}

export function validatePassword(password: string, salt: string) {
    try {
        const passwordHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return passwordHash;
    } catch (error) {
        return null;
    }
}

function generateNonce(): string {
    const arr = new Uint8Array(10);
    if (typeof window === 'undefined') {
        require('crypto').webcrypto.getRandomValues(arr);
    } else {
        window.crypto.getRandomValues(arr);
    }
    return Buffer.from(arr).toString('base64');
}

export async function getAccessSig(requestPayload: string): Promise<string> {
    const timestamp = Date.now();
    const nonce = generateNonce();
    const dataToSign = `${ACCESS_KEY_ID};1;${timestamp};${nonce};${ACCESS_KEY_SECRET};${requestPayload}`;
    const signature = (await sha256(dataToSign)).slice(0, 20).toString('base64');
    return `${ACCESS_KEY_ID};1;${timestamp};${nonce};${signature}`;
}

async function sha256(data: string): Promise<Buffer> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    let hashBuffer: ArrayBuffer;
    if (typeof window === 'undefined') {
        hashBuffer = await require('crypto').webcrypto.subtle.digest('SHA-256', dataBuffer);
    } else {
        hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    }
    return Buffer.from(hashBuffer);
}
