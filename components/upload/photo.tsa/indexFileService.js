// Index File Service - Separate from Upload Logic
// Creates personal index files for uploaded photos

import CryptoJS from 'crypto-js';

// AWS Signature v4 helper functions (copied from r2Server for independence)
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

const getSigningKey = (secretKey, dateStamp, region, service) => {
  const kDate = CryptoJS.HmacSHA256(dateStamp, `AWS4${secretKey}`);
  const kRegion = CryptoJS.HmacSHA256(region, kDate);
  const kService = CryptoJS.HmacSHA256(service, kRegion);
  const kSigning = CryptoJS.HmacSHA256('aws4_request', kService);
  return kSigning;
};

// Index File Service
const indexFileService = {
  // Create personal index file for uploaded photo
  createPersonalIndexFile: async (photoObjectKey, metadata, selectedCategory, bucketName) => {
    try {
      console.log('📄🔥 FORCE CREATE: Starting personal index file creation...');
      console.log('📄 INPUTS:', { photoObjectKey, selectedCategory, bucketName });
      console.log('📄 METADATA:', JSON.stringify(metadata, null, 2));
      
      // Extract username and filename from photoObjectKey
      // photoObjectKey format: {username}/{filename}.jpg
      const pathParts = photoObjectKey.split('/');
      const userFolder = pathParts[0]; // Direct username folder
      const fileNameWithExt = pathParts[pathParts.length - 1]; // filename.jpg
      const fileNameWithoutExt = fileNameWithExt.replace(/\.[^/.]+$/, '');
      
      console.log('📄 EXTRACTED:', {
        userFolder,
        fileNameWithExt,
        fileNameWithoutExt
      });
      
      // Create JSON file in same user folder: {username}/{filename}.json
      const indexObjectKey = `${userFolder}/${fileNameWithoutExt}.json`;
      console.log('📄 PATH: Index file will be created at:', indexObjectKey);
      
      // Complete JSON data with NO data loss - everything from upload screen
      const actualUserName = metadata?.userInfo?.userName || metadata?.userName || metadata?.userName || 'unknown_user';
      
      const completeJsonData = {
        "title": metadata?.photoTitle || metadata?.title || '',
        "tags": metadata?.tags || [],
        "category": selectedCategory, // Category in JSON but not in path
        "user_name": actualUserName,
        "user_logo": metadata?.userInfo?.channelLogo || metadata?.channelLogo || '',
        "photo_object_key": photoObjectKey,
        "media_file": fileNameWithExt, // Dynamic filename
        "bucket": bucketName,
        "created_at": new Date().toISOString(),
        
        // Simplified Folder Structure Info
        "user_folder": userFolder,
        "file_name": fileNameWithoutExt,
        "timestamp": metadata?.timestamp || Date.now(),
        "sanitized_username": metadata?.sanitizedUserName || ''
      };
      
      // Convert complete data to JSON string
      const indexJson = JSON.stringify(completeJsonData, null, 2);
      console.log('📄 JSON DATA:', indexJson);
      console.log('📄 UPLOADING: Creating JSON file alongside photo...');
      
      // Upload index file to R2
      const indexBuffer = Buffer.from(indexJson, 'utf8');
      const indexEndpoint = process.env.EXPO_PUBLIC_R2_ENDPOINT.replace(/\/$/, '');
      const indexUploadUrl = `${indexEndpoint}/${bucketName}/${indexObjectKey}`;
      
      console.log('📄 UPLOAD URL:', indexUploadUrl);
      console.log('📄 BUFFER SIZE:', indexBuffer.length, 'bytes');
      
      // Check environment variables
      console.log('📄 ENV CHECK:');
      console.log('- R2_ENDPOINT:', process.env.EXPO_PUBLIC_R2_ENDPOINT ? '✅' : '❌ MISSING');
      console.log('- R2_ACCESS_KEY:', process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID ? '✅' : '❌ MISSING');
      console.log('- R2_SECRET_KEY:', process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY ? '✅' : '❌ MISSING');
      
      if (!process.env.EXPO_PUBLIC_R2_ENDPOINT || !process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || !process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY) {
        throw new Error('Missing required R2 environment variables!');
      }
      
      // Create AWS signature for index file upload - SAME AS PHOTO UPLOAD
      const now = new Date();
      const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
      const dateStamp = amzDate.substr(0, 8);
      const region = 'us-east-1'; // R2 uses us-east-1 for signature
      const service = 's3';
      
      // Use same headers format as photo upload
      const headers = {
        'Host': new URL(indexEndpoint).host, // Same as photo upload
        'Content-Type': 'application/json',
        'x-amz-date': amzDate,
        'x-amz-content-sha256': CryptoJS.SHA256(indexJson).toString(CryptoJS.enc.Hex)
      };
      
      // Use same credential scope and canonical request format as photo upload
      const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
      const canonicalRequest = getCanonicalRequest('PUT', `/${bucketName}/${indexObjectKey}`, headers, CryptoJS.SHA256(indexJson).toString(CryptoJS.enc.Hex));
      const stringToSign = getStringToSign(amzDate, credentialScope, canonicalRequest);
      
      console.log('🔍 Debug - Index Object Key:', indexObjectKey);
      console.log('🔍 Debug - Index Canonical Request:', canonicalRequest);
      console.log('🔍 Debug - Index String to Sign:', stringToSign);
      
      // Same signing method as photo upload
      const signingKey = getSigningKey(process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY, dateStamp, region, service);
      const signature = getSignature(signingKey, stringToSign);
      
      console.log('🔍 Debug - Index Generated Signature:', signature);
      const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${Object.keys(headers).sort().map(key => key.toLowerCase()).join(';')}, Signature=${signature}`;
      
      const indexResponse = await fetch(indexUploadUrl, {
        method: 'PUT',
        headers: {
          ...headers,
          'Authorization': authorizationHeader,
        },
        body: indexBuffer,
      });
      
      if (indexResponse.ok) {
        console.log('✅🔥 SUCCESS: Personal index file created successfully!');
        console.log('✅ USER FOLDER:', userFolder);
        console.log('✅ FILES IN FOLDER:');
        console.log(`  📸 ${fileNameWithExt} - Photo file`);
        console.log(`  📄 ${fileNameWithoutExt}.json - Details file`);
        console.log('✅ FILE URL:', `${indexEndpoint}/${bucketName}/${indexObjectKey}`);
        console.log('✅ FOLDER URL:', `${indexEndpoint}/${bucketName}/${userFolder}/`);
        return {
          success: true,
          indexFileUrl: `${indexEndpoint}/${bucketName}/${indexObjectKey}`,
          folderUrl: `${indexEndpoint}/${bucketName}/${userFolder}/`,
          userFolder: userFolder,
          indexFileName: `${fileNameWithoutExt}.json`
        };
      } else {
        const errorText = await indexResponse.text();
        console.error('❌🔥 FAILED: Index file upload failed:', {
          status: indexResponse.status,
          statusText: indexResponse.statusText,
          errorText: errorText
        });
        return {
          success: false,
          error: `Failed to create index file: ${indexResponse.status} - ${errorText}`
        };
      }
      
    } catch (error) {
      console.error('❌🔥 CRITICAL ERROR: Personal index file creation failed!');
      console.error('❌ ERROR DETAILS:', error);
      console.error('❌ ERROR STACK:', error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

module.exports = indexFileService;
