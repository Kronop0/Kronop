const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// R2 S3 Client Configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.EXPO_PUBLIC_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY,
  },
});

// Create a simple test video file (MP4 header)
const createTestVideoFile = (filename) => {
  // Simple MP4 file header (minimal valid MP4)
  const mp4Header = Buffer.from([
    0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6F, 0x6D,
    0x00, 0x00, 0x02, 0x00, 0x69, 0x73, 0x6F, 0x6D, 0x69, 0x73, 0x6F, 0x32,
    0x61, 0x76, 0x63, 0x31, 0x6D, 0x70, 0x34, 0x31
  ]);
  
  fs.writeFileSync(filename, mp4Header);
  return filename;
};

// Test reels data
const testReels = [
  { name: 'sunset_timelapse.mp4', title: 'Sunset Timelapse' },
  { name: 'mumbai_street_food.mp4', title: 'Mumbai Street Food' },
  { name: 'bollywood_dance.mp4', title: 'Bollywood Dance' },
  { name: 'yoga_routine.mp4', title: 'Yoga Routine' },
  { name: 'butter_chicken.mp4', title: 'Butter Chicken Recipe' },
  { name: 'office_comedy.mp4', title: 'Office Comedy' },
  { name: 'smartphone_review.mp4', title: 'Smartphone Review' },
  { name: 'mountain_trek.mp4', title: 'Mountain Trek' }
];

async function uploadTestReels() {
  try {
    console.log('🎬 Starting upload of test reels to R2...');
    
    for (const reel of testReels) {
      const tempFile = `/tmp/${reel.name}`;
      
      // Create test file
      createTestVideoFile(tempFile);
      console.log(`📁 Created test file: ${reel.name}`);
      
      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: process.env.EXPO_PUBLIC_BUCKET_REELS,
        Key: `Reels/${reel.name}`,
        Body: fs.readFileSync(tempFile),
        ContentType: 'video/mp4',
      });

      await r2Client.send(command);
      console.log(`✅ Uploaded: ${reel.name}`);
      
      // Clean up temp file
      fs.unlinkSync(tempFile);
    }
    
    console.log('\n🎉 All test reels uploaded successfully!');
    console.log(`📍 Bucket: ${process.env.EXPO_PUBLIC_BUCKET_REELS}`);
    console.log(`🔗 Public URL: https://pub-600cd3134366496fadf941970cac2df6.r2.dev/Reels/[filename]`);
    
  } catch (error) {
    console.error('❌ Error uploading test reels:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
}

// Run the upload
uploadTestReels();
