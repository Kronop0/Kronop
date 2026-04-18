import { Video } from '../types';
import * as Crypto from 'expo-crypto';

// R2 Configuration from .env
const R2_CONFIG = {
  accountId: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '',
  accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || '',
  endpoint: process.env.EXPO_PUBLIC_R2_ENDPOINT || '',
  publicUrl: process.env.EXPO_PUBLIC_R2_PUBLIC_URL || '',
  buckets: {
    video: process.env.EXPO_PUBLIC_BUCKET_VIDEO || 'kronop-video',
    videoThumbnail: process.env.EXPO_PUBLIC_BUCKET_VIDEO_THUMBNAIL || 'kronop-video-tha',
  },
};

/**
 * AWS Signature V4 for R2 (S3-compatible)
 * Generates signed headers for R2 API requests
 */
async function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Promise<ArrayBuffer> {
  // kDate = HMAC_SHA256('AWS4' + secretKey, dateStamp)
  const kDate = await hmacSha256Binary('AWS4' + key, dateStamp);

  // kRegion = HMAC_SHA256(kDate, region)
  const kRegion = await hmacSha256Binary(kDate, regionName);

  // kService = HMAC_SHA256(kRegion, service)
  const kService = await hmacSha256Binary(kRegion, serviceName);

  // kSigning = HMAC_SHA256(kService, 'aws4_request')
  const kSigning = await hmacSha256Binary(kService, 'aws4_request');

  return kSigning;
}

/**
 * HMAC-SHA256 helper using expo-crypto - returns binary data
 */
async function hmacSha256Binary(key: string | ArrayBuffer, message: string): Promise<ArrayBuffer> {
  const BLOCK_SIZE = 64;
  const HASH_SIZE = 32;

  // Convert key and message to Uint8Array
  let keyBytes: Uint8Array;
  if (typeof key === 'string') {
    keyBytes = new TextEncoder().encode(key);
  } else {
    keyBytes = new Uint8Array(key);
  }
  const messageBytes = new TextEncoder().encode(message);

  // If key is longer than block size, hash it
  let keyPadded: Uint8Array;
  if (keyBytes.length > BLOCK_SIZE) {
    const hashedKey = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      new TextDecoder().decode(keyBytes)
    );
    // digestStringAsync returns hex, convert to bytes
    const keyHashBytes = hexToBytes(hashedKey);
    keyPadded = new Uint8Array(BLOCK_SIZE);
    keyPadded.set(new Uint8Array(keyHashBytes).subarray(0, HASH_SIZE));
  } else {
    keyPadded = new Uint8Array(BLOCK_SIZE);
    keyPadded.set(keyBytes);
  }

  // Create inner and outer pads
  const innerPad = new Uint8Array(BLOCK_SIZE + messageBytes.length);
  const outerPad = new Uint8Array(BLOCK_SIZE + HASH_SIZE);

  for (let i = 0; i < BLOCK_SIZE; i++) {
    innerPad[i] = keyPadded[i] ^ 0x36;
    outerPad[i] = keyPadded[i] ^ 0x5c;
  }

  innerPad.set(messageBytes, BLOCK_SIZE);

  // Hash inner pad + message - convert to hex for digestStringAsync
  const innerHashHex = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    bytesToHex(innerPad)
  );
  const innerHashBytes = hexToBytes(innerHashHex);

  outerPad.set(new Uint8Array(innerHashBytes), BLOCK_SIZE);

  // Hash outer pad + inner hash - convert to hex for digestStringAsync
  const outerHashHex = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    bytesToHex(outerPad)
  );

  return hexToBytes(outerHashHex);
}

/**
 * HMAC-SHA256 helper using expo-crypto - returns hex string
 */
async function hmacSha256(key: string | ArrayBuffer, message: string): Promise<string> {
  const result = await hmacSha256Binary(key, message);
  return bytesToHex(new Uint8Array(result));
}

function hexToBytes(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmacSha256Bytes(
  keyHex: string,
  message: string,
): Promise<string> {
  // Use hex key directly without corrupting conversion
  return await hmacSha256(keyHex, message);
}

/**
 * Generate public URL for R2 object
 */
function getPublicUrl(bucket: string, key: string): string {
  return `${R2_CONFIG.publicUrl}/${bucket}/${key}`;
}

/**
 * List all videos from R2 bucket
 * Uses S3 ListObjectsV2 API via R2 endpoint
 */
export async function listR2Videos(): Promise<Video[]> {
  try {
    const bucket = R2_CONFIG.buckets.video;
    const host = `${R2_CONFIG.accountId}.r2.cloudflarestorage.com`;
    const region = 'auto';
    const service = 's3';
    
    const now = new Date();
    const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
    const amzDate = now.toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';
    
    // Build canonical request
    const method = 'GET';
    const uri = `/${bucket}`;
    const queryString = 'list-type=2';
    const payloadHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // empty string hash

    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = `${method}\n${uri}\n${queryString}\n${canonicalHeaders}\n\n${signedHeaders}\n${payloadHash}`;
    
    // Debug logging
    console.log("Canonical Request:", canonicalRequest.replace(/\n/g, "\\n"));
    
    // Create string to sign
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const canonicalHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, canonicalRequest);
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalHash}`;
    
    console.log("String to Sign:", stringToSign.replace(/\n/g, "\\n"));

    // Calculate signature
    const signingKey = await getSignatureKey(R2_CONFIG.secretAccessKey, dateStamp, region, service);
    const signature = await hmacSha256(signingKey, stringToSign);
    
    // Build authorization header
    const authorization = `AWS4-HMAC-SHA256 Credential=${R2_CONFIG.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    
    console.log("Authorization:", authorization);
    
    // Make request
    const url = `https://${host}${uri}?${queryString}`;
    
    console.log("Request URL:", url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Host': host,
        'X-Amz-Content-Sha256': payloadHash,
        'X-Amz-Date': amzDate,
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("R2 Error response:", errorText);
      throw new Error(`R2 API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const xmlText = await response.text();
    
    // Parse XML response (simple parser)
    const videos = parseR2ListResponse(xmlText);
    
    return videos;
  } catch (error) {
    console.error('Error listing R2 videos:', error);
    return [];
  }
}

/**
 * Parse R2 ListObjectsV2 XML response
 */
function parseR2ListResponse(xmlText: string): Video[] {
  const videos: Video[] = [];
  
  // Extract Contents elements (files)
  const contentsRegex = /<Contents>([\s\S]*?)<\/Contents>/g;
  let match;
  
  while ((match = contentsRegex.exec(xmlText)) !== null) {
    const contentBlock = match[1];
    
    // Extract Key (filename)
    const keyMatch = contentBlock.match(/<Key>(.*?)<\/Key>/);
    const key = keyMatch ? keyMatch[1] : '';
    
    // Extract LastModified
    const dateMatch = contentBlock.match(/<LastModified>(.*?)<\/LastModified>/);
    const lastModified = dateMatch ? new Date(dateMatch[1]).getTime() : Date.now();
    
    // Extract Size
    const sizeMatch = contentBlock.match(/<Size>(\d+)<\/Size>/);
    const size = sizeMatch ? parseInt(sizeMatch[1], 10) : 0;
    
    // Skip if not a video file
    if (!key.match(/\.(mp4|m3u8|mov|webm)$/i)) {
      continue;
    }
    
    // Generate IDs and URLs
    const id = key.replace(/[^a-zA-Z0-9]/g, '_');
    const videoUrl = getPublicUrl(R2_CONFIG.buckets.video, key);
    const thumbnailKey = key.replace(/\.[^.]+$/, '.jpg');
    const thumbnailUrl = getPublicUrl(R2_CONFIG.buckets.videoThumbnail, thumbnailKey);
    
    videos.push({
      id,
      userId: 'r2_user',
      username: 'Kronop Creator',
      userAvatar: `https://i.pravatar.cc/150?u=${id}`,
      thumbnailUrl,
      videoUrl,
      title: key.replace(/\.[^.]+$/, '').replace(/_/g, ' ').replace(/-/g, ' '),
      description: `Video uploaded from R2 storage`,
      views: Math.floor(size / 10000), // Mock views based on file size
      likes: Math.floor(size / 50000),
      comments: Math.floor(size / 100000),
      shares: 0,
      earnings: 0,
      duration: '10:00', // Will be updated when video loads
      timestamp: lastModified,
      isLiked: false,
      isSaved: false,
      category: 'R2 Upload',
    });
  }
  
  return videos.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Get video metadata from R2
 */
export async function getR2VideoMetadata(key: string): Promise<Partial<Video> | null> {
  try {
    const headUrl = `${R2_CONFIG.publicUrl}/${R2_CONFIG.buckets.video}/${key}`;
    
    const response = await fetch(headUrl, { method: 'HEAD' });
    
    if (!response.ok) {
      return null;
    }
    
    const contentLength = response.headers.get('content-length');
    const lastModified = response.headers.get('last-modified');
    
    return {
      duration: contentLength ? formatDuration(parseInt(contentLength, 10)) : '0:00',
      timestamp: lastModified ? new Date(lastModified).getTime() : Date.now(),
    };
  } catch (error) {
    console.error('Error getting video metadata:', error);
    return null;
  }
}

/**
 * Format duration from file size (rough estimate)
 */
function formatDuration(bytes: number): string {
  // Assume average bitrate of 2 Mbps
  const seconds = Math.floor(bytes * 8 / 2000000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Check if R2 is configured properly
 */
export function isR2Configured(): boolean {
  return !!(
    R2_CONFIG.accountId &&
    R2_CONFIG.accessKeyId &&
    R2_CONFIG.secretAccessKey &&
    R2_CONFIG.publicUrl
  );
}
