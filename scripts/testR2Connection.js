const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// R2 S3 Client Configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.EXPO_PUBLIC_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY,
  },
});

async function testR2Connection() {
  try {
    console.log('🔗 Testing R2 connection...');
    console.log('📍 Endpoint:', process.env.EXPO_PUBLIC_R2_ENDPOINT);
    console.log('🪣 Bucket:', process.env.EXPO_PUBLIC_BUCKET_REELS);
    
    // Test listing objects
    const command = new ListObjectsV2Command({
      Bucket: process.env.EXPO_PUBLIC_BUCKET_REELS,
      MaxKeys: 10,
    });

    const response = await r2Client.send(command);
    
    console.log('✅ R2 Connection successful!');
    console.log('📊 Objects found:', response.KeyCount || 0);
    
    if (response.Contents && response.Contents.length > 0) {
      console.log('📋 Files in bucket:');
      response.Contents.forEach((obj, index) => {
        console.log(`   ${index + 1}. ${obj.Key} (${obj.Size} bytes)`);
      });
    } else {
      console.log('📭 Bucket is empty');
    }
    
  } catch (error) {
    console.error('❌ R2 Connection failed:', error.message);
    console.error('🔍 Full error:', error);
    
    // Check if credentials are available
    console.log('\n🔍 Checking credentials:');
    console.log('   Access Key ID:', process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID ? '✅ Available' : '❌ Missing');
    console.log('   Secret Access Key:', process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY ? '✅ Available' : '❌ Missing');
    console.log('   Endpoint:', process.env.EXPO_PUBLIC_R2_ENDPOINT || '❌ Missing');
    console.log('   Bucket:', process.env.EXPO_PUBLIC_BUCKET_REELS || '❌ Missing');
  }
}

// Run the test
testR2Connection();
