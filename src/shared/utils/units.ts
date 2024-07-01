export function bytesSize(size: number) {
    if (size <= 0) {
        return '0B';
    }

    const base = 1024;
    const exp = Math.floor(Math.log(size) / Math.log(base));
    const result = size / Math.pow(base, exp);
    const rounded = Math.round(Math.floor(result * 100) / 100);
    return rounded + ' ' + (exp === 0 ? '' : 'KMGTPEZY'[exp - 1]) + 'B';
}
