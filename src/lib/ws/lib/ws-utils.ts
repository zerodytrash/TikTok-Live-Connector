/**
 * Generates a random java.Long for the uniqId string.
 */
export function generateUniqId() {
    const bytes = crypto.getRandomValues(new Uint8Array(8));
    bytes[0] &= 0x7F; // clear sign bit → positive
    let val = 0n;
    for (const b of bytes) val = (val << 8n) | BigInt(b);
    if (val === 0n) val = 1n; // minimum 1
    return val.toString();
}
