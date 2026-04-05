// Powered by OnSpace.AI
// Cloudflare R2 upload — pure fetch + AWS Sig V4 (React Native compatible)
import * as FileSystem from 'expo-file-system';
import {
  R2_CONFIG, R2_ENDPOINT, R2_HOST,
  toHex, hmacSha256, sha256Hex,
  getDateStrings, deriveSigningKey,
} from './r2Helpers';

export interface UploadProgress { uploaded: number; total: number; }

/**
 * Uploads a video chunk from a local file URI to Cloudflare R2.
 * @param fileUri    local file:// URI from expo-camera recordAsync()
 * @param key        R2 object key e.g. "live/session_123/chunk_0.mp4"
 * @param onProgress optional bytes progress callback
 */
export async function uploadChunkToR2(
  fileUri: string,
  key: string,
  onProgress?: (p: UploadProgress) => void
): Promise<void> {
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const binaryStr = atob(base64);
  const bodyBytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bodyBytes[i] = binaryStr.charCodeAt(i);
  }

  const contentType = 'video/mp4';
  const url = `${R2_ENDPOINT}/${R2_CONFIG.BUCKET}/${key}`;
  const now = new Date();
  const { dateStr, amzDate } = getDateStrings(now);
  const payloadHash = await sha256Hex(bodyBytes.buffer);

  const canonicalUri = `/${R2_CONFIG.BUCKET}/${key}`;
  const canonicalHeaders =
    `content-type:${contentType}\n` +
    `host:${R2_HOST}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';

  const canonicalRequest = [
    'PUT', canonicalUri, '',
    canonicalHeaders, signedHeaders, payloadHash,
  ].join('\n');

  const credentialScope = `${dateStr}/${R2_CONFIG.REGION}/${R2_CONFIG.SERVICE}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256', amzDate, credentialScope,
    await sha256Hex(canonicalRequest),
  ].join('\n');

  const signingKey = await deriveSigningKey(dateStr);
  const signature = toHex(await hmacSha256(signingKey, stringToSign));

  const authHeader =
    `AWS4-HMAC-SHA256 Credential=${R2_CONFIG.ACCESS_KEY}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.setRequestHeader('x-amz-content-sha256', payloadHash);
    xhr.setRequestHeader('x-amz-date', amzDate);
    xhr.setRequestHeader('Authorization', authHeader);
    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress({ uploaded: e.loaded, total: e.total });
      };
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`R2 upload failed [${xhr.status}]: ${xhr.responseText}`));
    };
    xhr.onerror = () => reject(new Error('R2 network error'));
    xhr.send(bodyBytes);
  });

  console.log(`[R2] Uploaded: ${key} (${bodyBytes.length} bytes)`);
  await FileSystem.deleteAsync(fileUri, { idempotent: true });
}
