const mongoose = require('mongoose');
const User = require('../models/User');

// Demo user data
const demoUserData = {
  username: 'kronop_demo',
  displayName: 'Kronop Demo',
  email: 'demo@kronop.com',
  phone: '+919876543210',
  avatar: 'https://picsum.photos/200/200?random=kronop',
  bio: '🎬 Welcome to Kronop! This is your demo profile. Explore all sections below to see how the app works! 📱✨',
  supporters: [],
  supporting: [],
  verified: true,
  createdAt: new Date()
};

async function createDemoUser() {
  try {
    // Connect to MongoDB - ONLY ENVIRONMENT VARIABLES
    const MONGODB_URI = process.env.EXPO_PUBLIC_MONGODB_URI || process.env.MONGODB_URI;
    
    console.log('🔗 Connecting to MongoDB...');
    console.log(`📍 URI: ${MONGODB_URI}`); // Removed hardcoded MongoDB URLs

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if demo user already exists
    const existingUser = await User.findOne({ username: 'kronop_demo' });
    if (existingUser) {
      console.log('🔄 Demo user already exists, updating...');
      await User.updateOne({ username: 'kronop_demo' }, demoUserData);
      console.log('✅ Demo user updated successfully');
    } else {
      // Create new demo user
      const demoUser = new User(demoUserData);
      await demoUser.save();
      console.log('✅ Demo user created successfully');
    }

    // Get the created/updated user
    const user = await User.findOne({ username: 'kronop_demo' });
    console.log('📋 Demo User Details:');
    console.log(`   ID: ${user._id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Display Name: ${user.displayName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Phone: ${user.phone}`);
    console.log(`   Avatar: ${user.avatar}`);
    console.log(`   Bio: ${user.bio}`);
    console.log(`   Supporters: ${user.supporters.length}`);
    console.log(`   Supporting: ${user.supporting.length}`);
    console.log(`   Verified: ${user.verified}`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Run the script
createDemoUser();
