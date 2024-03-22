import * as elliptic from 'elliptic';
import * as base58check from 'bs58check';
import * as crypto from 'crypto';

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

    // Depending on how your public key is formatted, you might need to convert it to a format elliptic can use
    // This step is highly dependent on the format of your key and the specifics of your use case
    const publicKeyHex = Buffer.from(publicKeyBytes).toString('hex');

    // Step 2: Import the public key
    const key = ec.keyFromPublic(publicKeyHex, 'hex');

    // Step 3: Verify the signature
    // Note: This assumes your original message or its hash is a string
    // Convert your original message to a format suitable for your signature verification process
    // This might involve hashing it first depending on your specific use case
    const isVerified = key.verify(data, signature);

    return isVerified;
}
