// Test all music files in R2 bucket for accessibility
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// Configuration
const config = {
  accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY,
  endpoint: process.env.EXPO_PUBLIC_R2_ENDPOINT,
  bucket: process.env.EXPO_PUBLIC_BUCKET_SONG || 'kronop-songs',
  publicUrl: process.env.EXPO_PUBLIC_R2_PUBLIC_URL
};

console.log('🔍 Testing All Music Files in R2 Bucket');
console.log('===========================================');
console.log('Config:', {
  hasAccessKey: !!config.accessKeyId,
  hasSecretKey: !!config.secretAccessKey,
  endpoint: config.endpoint,
  bucket: config.bucket,
  publicUrl: config.publicUrl,
  accessKeyIdPrefix: config.accessKeyId?.substring(0, 8) + '...'
});

if (!config.accessKeyId || !config.secretAccessKey || !config.endpoint) {
  console.log('❌ R2 credentials not properly configured');
  process.exit(1);
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: config.endpoint,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

async function testAllFiles() {
  try {
    console.log('\n📋 Listing all files in bucket...');
    const listCommand = new ListObjectsV2Command({
      Bucket: config.bucket,
      MaxKeys: 1000,
    });
    
    const response = await s3Client.send(listCommand);
    
    if (!response.Contents || response.Contents.length === 0) {
      console.log('❌ No files found in bucket');
      return;
    }
    
    console.log(`✅ Found ${response.Contents.length} files`);
    console.log('\n📋 Testing file accessibility...\n');
    
    const audioFiles = response.Contents.filter(item => {
      const key = item.Key || '';
      const ext = key.toLowerCase().split('.').pop();
      return ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'].includes(ext);
    });
    
    console.log(`🎵 Found ${audioFiles.length} audio files`);
    
    let accessibleCount = 0;
    let inaccessibleCount = 0;
    
    for (let i = 0; i < audioFiles.length; i++) {
      const item = audioFiles[i];
      const key = item.Key || '';
      const size = item.Size || 0;
      const fileName = key.split('/').pop() || key;
      
      console.log(`\n📁 File ${i + 1}/${audioFiles.length}: ${fileName}`);
      console.log(`   Size: ${(size / 1024 / 1024).toFixed(2)} MB`);
      
      // Test public URL
      if (config.publicUrl) {
        const publicUrl = `${config.publicUrl}/${key}`;
        console.log(`   Public URL: ${publicUrl.substring(0, 100)}...`);
        
        try {
          const fetch = require('node-fetch');
          const response = await fetch(publicUrl, { 
            method: 'HEAD',
            timeout: 10000 
          });
          
          console.log(`   Public Status: ${response.status} ${response.statusText}`);
          console.log(`   Content-Type: ${response.headers.get('content-type') || 'Unknown'}`);
          
          if (response.ok) {
            console.log(`   ✅ Public URL accessible`);
            accessibleCount++;
          } else {
            console.log(`   ❌ Public URL not accessible (${response.status})`);
            inaccessibleCount++;
          }
        } catch (fetchError) {
          console.log(`   ❌ Public URL fetch failed: ${fetchError.message}`);
          inaccessibleCount++;
        }
      } else {
        console.log(`   ⚠️ No public URL configured`);
      }
      
      // Rate limiting to avoid overwhelming the server
      if (i < audioFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log('\n📊 Summary Results:');
    console.log('==================');
    console.log(`✅ Accessible files: ${accessibleCount}`);
    console.log(`❌ Inaccessible files: ${inaccessibleCount}`);
    console.log(`📈 Success rate: ${((accessibleCount / audioFiles.length) * 100).toFixed(1)}%`);
    
    if (inaccessibleCount > 0) {
      console.log('\n🔧 Recommendations:');
      if (!config.publicUrl) {
        console.log('   • Set EXPO_PUBLIC_R2_PUBLIC_URL environment variable');
      } else {
        console.log('   • Check if bucket is configured for public access');
        console.log('   • Verify public URL domain is correct');
        console.log('   • Check CORS settings on R2 bucket');
      }
      console.log('   • Verify R2 credentials have proper permissions');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
}

// Run the test
testAllFiles().then(() => {
  console.log('\n🎯 Test completed');
}).catch(error => {
  console.error('❌ Test failed:', error);
});
