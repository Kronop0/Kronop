#!/usr/bin/env node

// Test Script to Verify Photo Upload Environment Variables
console.log('🔍 PHOTO UPLOAD ENVIRONMENT VARIABLES CHECK');
console.log('==========================================');

// Check all required environment variables
const requiredVars = [
  'EXPO_PUBLIC_R2_ACCESS_KEY_ID',
  'EXPO_PUBLIC_R2_SECRET_ACCESS_KEY',
  'EXPO_PUBLIC_BUCKET_PHOTO',
  'EXPO_PUBLIC_R2_ENDPOINT',
  'EXPO_PUBLIC_R2_ACCOUNT_ID'
];

let allVarsPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value.trim() !== '') {
    console.log(`✅ ${varName}: Present (${value.length} chars)`);
  } else {
    console.log(`❌ ${varName}: MISSING OR EMPTY`);
    allVarsPresent = false;
  }
});

console.log('\n📊 SUMMARY:');
if (allVarsPresent) {
  console.log('✅ All environment variables are present!');
  console.log('🚀 Photo upload should work correctly.');
} else {
  console.log('❌ Some environment variables are missing!');
  console.log('⚠️ Photo upload may fail.');
  console.log('\n💡 SOLUTION:');
  console.log('1. Check your .env file');
  console.log('2. Make sure EXPO_PUBLIC_BUCKET_PHOTO is set');
  console.log('3. Verify R2 credentials are correct');
  console.log('4. Restart your development server');
}

// Test bucket name specifically
const bucketName = process.env.EXPO_PUBLIC_BUCKET_PHOTO;
if (bucketName) {
  console.log(`\n📦 Bucket Configuration:`);
  console.log(`- Bucket Name: ${bucketName}`);
  console.log(`- Expected Photo Path: photo/${bucketName}/`);
  console.log(`- Expected JSON Path: photo/filename.json`);
}

console.log('\n🔧 DEBUG: Photo Upload Flow');
console.log('1. User selects photo + enters details');
console.log('2. PhotoUpload.tsx -> photo.js -> r2Server.js (uploads photo)');
console.log('3. photo.js -> indexFileService.js (creates JSON)');
console.log('4. Both files stored in R2 bucket');
