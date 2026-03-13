// Direct MongoDB Clear Script
// Clears all content using direct database connection

const mongoose = require('mongoose');
const Content = require('../models/Content');

async function clearAllContent() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Connect to database - ONLY ENVIRONMENT VARIABLES
    const MONGODB_URI = process.env.EXPO_PUBLIC_MONGODB_URI || process.env.MONGODB_URI;
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all content
    console.log('🗑️ Clearing all content from database...');
    const result = await Content.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} items`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');

    return {
      success: true,
      deletedCount: result.deletedCount,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error clearing database:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Run if called directly
if (require.main === module) {
  clearAllContent()
    .then(result => {
      console.log('🎯 Final Result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { clearAllContent };
