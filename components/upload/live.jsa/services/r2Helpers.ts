// Powered by OnSpace.AI
// AWS Signature V4 helpers — pure JS, React Native compatible

export const R2_CONFIG = {
  ACCOUNT_ID: 'f9bb6756691d33713172b3bf9afdd0f4',
  ACCESS_KEY: '465983939146a7cbb7167537d9d4ebd1',
  SECRET_KEY: '7386255bccd5111ddd8bd3057bbe8995e2c02a74b3ef579cd6b0daf4c1500c94',
  BUCKET: 'kronop-live',
  REGION: 'auto',
  SERVICE: 's3',
};

export const R2_ENDPOINT = `https://${R2_CONFIG.ACCOUNT_ID}.r2.cloudflarestorage.com`;
export const R2_HOST = `${R2_CONFIG.ACCOUNT_ID}.r2.cloudflarestorage.com`;

export function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hmacSha256(
  key: ArrayBuffer | string,
  data: string
): Promise<ArrayBuffer> {
  const keyBytes =
    typeof key === 'string'
      ? new TextEncoder().encode(key)
      : new Uint8Array(key);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
}

export async function sha256Hex(data: ArrayBuffer | string): Promise<string> {
  const bytes =
    typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return toHex(hash);
}

export function getDateStrings(now: Date) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr =
    now.getUTCFullYear().toString() +
    pad(now.getUTCMonth() + 1) +
    pad(now.getUTCDate());
  const timeStr =
    pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + pad(now.getUTCSeconds());
  return { dateStr, amzDate: `${dateStr}T${timeStr}Z` };
}

export async function deriveSigningKey(dateStr: string): Promise<ArrayBuffer> {
  const { SECRET_KEY, REGION, SERVICE } = R2_CONFIG;
  const kDate = await hmacSha256(`AWS4${SECRET_KEY}`, dateStr);
  const kRegion = await hmacSha256(kDate, REGION);
  const kService = await hmacSha256(kRegion, SERVICE);
  return hmacSha256(kService, 'aws4_request');
}
