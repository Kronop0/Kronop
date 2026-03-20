// R2 Upload Server - React Native Compatible (Photo Upload)
// Uses proper AWS signature for Cloudflare R2

import CryptoJS from 'crypto-js';

// Helper function to get file extension
const getFileExtension = (fileName) => {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot !== -1 ? fileName.substring(lastDot) : '';
};

// Helper function to get file name without extension
const getFileNameWithoutExtension = (fileName) => {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot !== -1 ? fileName.substring(0, lastDot) : fileName;
};

// AWS Signature v4 helper functions
const getCanonicalRequest = (method, path, headers, payloadHash) => {
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map(key => `${key.toLowerCase()}:${headers[key]}\n`)
    .join('');

  const signedHeaders = Object.keys(headers)
    .sort()
    .map(key => key.toLowerCase())
    .join(';');

  return `${method}\n${path}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
};

const getStringToSign = (timestamp, credentialScope, canonicalRequest) => {
  const hashedCanonicalRequest = CryptoJS.SHA256(canonicalRequest).toString(CryptoJS.enc.Hex);
  return `AWS4-HMAC-SHA256\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;
};

const getSignature = (key, stringToSign) => {
  return CryptoJS.HmacSHA256(stringToSign, key).toString(CryptoJS.enc.Hex);
};

// Function to derive signing key for AWS Signature v4
const getSigningKey = (secretKey, dateStamp, region, service) => {
  const kDate = CryptoJS.HmacSHA256(dateStamp, `AWS4${secretKey}`);
  const kRegion = CryptoJS.HmacSHA256(region, kDate);
  const kService = CryptoJS.HmacSHA256(service, kRegion);
  const kSigning = CryptoJS.HmacSHA256('aws4_request', kService);
  return kSigning;
};

// R2 Upload Handler
const r2UploadHandler = {
  // Upload Photos to R2 (photo folder)
  uploadPhoto: async (fileBuffer, fileName, metadata) => {
    try {
      console.log('📸 Uploading photo to R2:', fileName);

      // Validate required environment variables
      if (!process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || !process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || !process.env.EXPO_PUBLIC_BUCKET_PHOTO || !process.env.EXPO_PUBLIC_R2_ENDPOINT) {
        throw new Error('Missing required R2 environment variables');
      }

      // Convert buffer to CryptoJS WordArray for hashing
      let wordArray;
      if (fileBuffer instanceof Buffer) {
        // Convert Buffer to Uint8Array then to WordArray
        const uint8Array = new Uint8Array(fileBuffer);
        wordArray = CryptoJS.lib.WordArray.create(uint8Array);
      } else if (fileBuffer instanceof ArrayBuffer) {
        // Convert ArrayBuffer to Uint8Array then to WordArray
        const uint8Array = new Uint8Array(fileBuffer);
        wordArray = CryptoJS.lib.WordArray.create(uint8Array);
      } else {
        throw new Error('Unsupported file buffer type');
      }

      // Calculate SHA256 hash of the payload
      const payloadHash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);

      // Convert to Uint8Array for fetch
      const byteArray = new Uint8Array(wordArray.sigBytes);
      for (let i = 0; i < wordArray.sigBytes; i++) {
        byteArray[i] = (wordArray.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      }

      // Extract file information
      const fileExtension = getFileExtension(fileName) || '.jpg';

      // Determine content type
      const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      };
      const contentType = contentTypes[fileExtension.toLowerCase()] || 'image/jpeg';

      // Dynamic User-Based Folder Structure - SIMPLIFIED
      // Get user info for folder structure - DYNAMIC
      const userName = metadata?.userInfo?.userName || metadata?.userName || 'unknown_user';
      const sanitizedUserName = String(userName)
        .replace(/\//g, '_')
        .replace(/[^\w\-.]/g, '_');

      // Create clean folder structure: {username}/
      const userFolder = sanitizedUserName; // Direct username folder
      
      // Create R2 upload URL - Simplified folder structure
      const bucketName = process.env.EXPO_PUBLIC_BUCKET_PHOTO;
      const safeFileName = String(fileName)
        .split('/').pop()
        .replace(/[^\w\-_.]/g, '_'); // Sanitize filename

      // Final file path: {username}/{filename}.jpg (no extra folders)
      const objectKey = `${userFolder}/${safeFileName}`;
      const endpoint = process.env.EXPO_PUBLIC_R2_ENDPOINT.replace(/\/$/, '');
      const uploadUrl = `${endpoint}/${bucketName}/${objectKey}`;
      
      console.log('📁 Folder Structure:', {
        userFolder,
        objectKey,
        userName,
        sanitizedUserName,
        safeFileName
      });

      console.log('🚀 Starting R2 photo upload...');
      console.log('🔍 Debug - Endpoint:', endpoint);
      console.log('🔍 Debug - Upload URL:', uploadUrl);

      // Create AWS Signature v4
      const now = new Date();
      const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
      const dateStamp = amzDate.substr(0, 8);
      const region = 'us-east-1'; // R2 uses us-east-1 for signature
      const service = 's3';

      const headers = {
        'Host': new URL(endpoint).host,
        'Content-Type': contentType,
        'x-amz-date': amzDate,
        'x-amz-content-sha256': payloadHash, // Use actual payload hash
      };

      const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
      const canonicalRequest = getCanonicalRequest('PUT', `/${bucketName}/${objectKey}`, headers, payloadHash);
      const stringToSign = getStringToSign(amzDate, credentialScope, canonicalRequest);

      // Debug logging for signature
      console.log('🔍 Debug - Object Key:', objectKey);
      console.log('🔍 Debug - Canonical Request:', canonicalRequest);
      console.log('🔍 Debug - String to Sign:', stringToSign);

      // Derive signing key using the correct method
      const signingKey = getSigningKey(process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY, dateStamp, region, service);
      const signature = getSignature(signingKey, stringToSign);

      console.log('🔍 Debug - Generated Signature:', signature);

      const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${Object.keys(headers).sort().map(k => k.toLowerCase()).join(';')}, Signature=${signature}`;

      // Upload using fetch API with proper auth
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          ...headers,
          'Authorization': authorizationHeader,
        },
        body: byteArray,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload response error:', errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.log('✅ Photo uploaded successfully to R2');

      return {
        success: true,
        fileId: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fileName: safeFileName,
        originalName: fileName,
        fileSize: byteArray.length,
        contentType: contentType,
        bucket: bucketName,
        key: objectKey,
        publicUrl: uploadUrl,
        uploadTime: new Date().toISOString(),
        metadata: {
          // User Info from Photo Upload Screen (Dynamic)
          userName: metadata?.userInfo?.userName || metadata?.userName,
          channelLogo: metadata?.userInfo?.channelLogo || metadata?.channelLogo,
          
          // Content Info from Photo Upload Screen
          photoTitle: metadata?.photoTitle || metadata?.title || '',
          selectedCategory: metadata?.selectedCategory || metadata?.category || 'All', // Dynamic category from upload screen
          tags: metadata?.tags || [],
          description: metadata?.description || '',
          
          // Folder Structure Info
          userFolder: userFolder,
          sanitizedUserName: sanitizedUserName
        }
      };

    } catch (error) {
      console.error('❌ R2 photo upload error:', error);
      return {
        success: false,
        message: 'Photo upload failed to Cloudflare R2',
        error: error.message,
        fileId: null,
        publicUrl: null
      };
    }
  }
};

module.exports = r2UploadHandler;