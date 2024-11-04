export function splitStringInHalf(string: string) {
    const midpoint = Math.ceil(string.length / 2);
    const firstHalf = string.slice(0, midpoint);
    const secondHalf = string.slice(midpoint);
    return [firstHalf, secondHalf];
}
