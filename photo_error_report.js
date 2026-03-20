#!/usr/bin/env node

// ==================== PHOTO ERROR REPORT GENERATOR ====================
// Comprehensive analysis of Apptepbar/photos folder and r2_service.ts

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config();

console.log('='.repeat(80));
console.log('📊 PHOTO ERROR REPORT - Apptepbar/photos Folder Analysis');
console.log('='.repeat(80));

// 1. CONNECTION STATUS CHECK
console.log('\n🔗 कनेक्शन की सच्चाई (Connection Status):');
console.log('-'.repeat(50));

// Check environment variables
const envVars = [
  'EXPO_PUBLIC_R2_ACCOUNT_ID',
  'EXPO_PUBLIC_R2_ACCESS_KEY_ID',
  'EXPO_PUBLIC_R2_SECRET_ACCESS_KEY',
  'EXPO_PUBLIC_R2_BUCKET_NAME',
  'EXPO_PUBLIC_R2_ENDPOINT'
];

let envStatus = true;
envVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ Set' : '❌ Missing';
  console.log(`${varName}: ${status}`);
  if (!value) envStatus = false;
});

// Check API URL
const apiUrl = process.env.KRONOP_API_URL || 'https://kronop-backend.onrender.com';
console.log(`KRONOP_API_URL: ${apiUrl} ${apiUrl.includes('kronop') ? '✅' : '❌'}`);

// Test connection to R2 API
console.log('\n🌐 Testing API Connectivity...');
const testUrl = `${apiUrl}/api/content/photo?category=all&limit=1`;

const testConnection = () => {
  return new Promise((resolve) => {
    https.get(testUrl, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`API Response Status: ${res.statusCode}`);
          console.log(`API Response Success: ${response.success ? '✅' : '❌'}`);
          resolve({ connected: true, status: res.statusCode, data: response });
        } catch (e) {
          console.log(`API Response: Invalid JSON - ${e.message}`);
          resolve({ connected: false, error: 'Invalid JSON' });
        }
      });
    }).on('error', (err) => {
      console.log(`API Connection Failed: ${err.message}`);
      resolve({ connected: false, error: err.message });
    });
  });
};

// 2. DATA BLOCKAGE ANALYSIS
console.log('\n📊 डेटा कहाँ रुक रहा है? (Data Blockage):');
console.log('-'.repeat(50));

async function analyzeDataBlockage() {
  const connectionResult = await testConnection();

  if (!connectionResult.connected) {
    console.log('❌ API Connection Failed - Cannot fetch photos');
    console.log('Possible issues:');
    console.log('- API server down');
    console.log('- Network connectivity');
    console.log('- CORS issues');
    return;
  }

  console.log('✅ API Connected Successfully');

  // Test different categories
  const categories = ['all', 'aesthetic'];
  for (const category of categories) {
    console.log(`\nTesting Category: ${category}`);
    const categoryUrl = `${apiUrl}/api/content/photo?category=${category}&limit=5`;

    try {
      const response = await new Promise((resolve, reject) => {
        https.get(categoryUrl, { timeout: 15000 }, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(data) });
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
      });

      if (response.data.success && response.data.data) {
        console.log(`✅ ${category}: ${response.data.data.length} photos received`);
        if (response.data.data.length > 0) {
          console.log(`Sample Photo: ${response.data.data[0].filename || 'No filename'}`);
        }
      } else {
        console.log(`❌ ${category}: No data received or API error`);
        console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
      }
    } catch (error) {
      console.log(`❌ ${category}: Request failed - ${error.message}`);
    }
  }
}

// 3. FILE CONFLICT ANALYSIS
console.log('\n⚔️ फाइलों का झगड़ा (File Conflict):');
console.log('-'.repeat(50));

// Read and analyze key files
const filesToCheck = [
  'Apptepbar/photos/r2_service.ts',
  'Apptepbar/photos/index.tsx',
  'Apptepbar/photos/Categories/index.ts'
];

filesToCheck.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    console.log(`✅ ${filePath}: Exists (${content.length} chars)`);

    // Check for potential issues
    if (content.includes('fallback') && content.includes('mock')) {
      console.log(`   ⚠️  Contains fallback/mock data logic`);
    }
    if (content.includes('error') && content.includes('catch')) {
      console.log(`   ℹ️  Has error handling`);
    }
  } else {
    console.log(`❌ ${filePath}: Missing`);
  }
});

// Check Categories folder
const categoriesPath = path.join(process.cwd(), 'Apptepbar/photos/Categories');
if (fs.existsSync(categoriesPath)) {
  const categoryFiles = fs.readdirSync(categoriesPath);
  console.log(`\nCategories found: ${categoryFiles.length}`);
  categoryFiles.forEach(file => {
    if (file.endsWith('.tsx')) {
      console.log(`   📁 ${file}`);
    }
  });
} else {
  console.log('❌ Categories folder missing');
}

// 4. LOGIC ERROR ANALYSIS
console.log('\n🧠 लॉजिक एरर (Logic Error):');
console.log('-'.repeat(50));

// Check category mapping
const r2ServicePath = path.join(process.cwd(), 'Apptepbar/photos/r2_service.ts');
if (fs.existsSync(r2ServicePath)) {
  const r2Content = fs.readFileSync(r2ServicePath, 'utf8');

  console.log('Photo Categories in r2_service.ts:');
  const categoriesMatch = r2Content.match(/PHOTO_CATEGORIES\s*=\s*\{([\s\S]*?)\}/);
  if (categoriesMatch) {
    const categories = categoriesMatch[1].match(/(\w+):\s*'([^']+)'/g);
    if (categories) {
      categories.forEach(cat => {
        const [key, value] = cat.split(':').map(s => s.trim().replace(/['"]/g, ''));
        console.log(`   ${key} -> ${value}`);
      });
    }
  }

  // Check if 'all' and 'aesthetic' are properly defined
  console.log('\nChecking specific categories:');
  console.log(`   'all' category: ${r2Content.includes("'all'") ? '✅' : '❌'}`);
  console.log(`   'aesthetic' category: ${r2Content.includes("'aesthetic'") ? '✅' : '❌'}`);
}

// 5. STYLING ISSUES ANALYSIS
console.log('\n🎨 स्टाइलिंग की बाधा (Styling Issues):');
console.log('-'.repeat(50));

// Check styling in PhotoPlayer and Categories
const stylingFiles = [
  'Apptepbar/photos/PhotoPlayer.tsx',
  'Apptepbar/photos/Categories/AllCategory.tsx',
  'Apptepbar/photos/Categories/AestheticCategory.tsx'
];

stylingFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');

    console.log(`\n${filePath}:`);
    console.log(`   Height styling: ${content.includes('height') ? '✅' : '❌'}`);
    console.log(`   Border radius: ${content.includes('borderRadius') || content.includes('border-radius') ? '✅' : '❌'}`);
    console.log(`   Sharp corners: ${content.includes('borderRadius: 0') || content.includes('border-radius: 0') ? '⚠️ Sharp' : '🔄 Rounded'}`);

    // Check for potential style issues
    if (content.includes('height:') && !content.includes('flex')) {
      console.log(`   ⚠️  Fixed height without flex might cause issues`);
    }
  } else {
    console.log(`❌ ${filePath}: Missing`);
  }
});

// FINAL REPORT
console.log('\n='.repeat(80));
console.log('🎯 असली समस्या की जड़ (Root Cause Analysis):');
console.log('='.repeat(80));

// Run the analysis
analyzeDataBlockage().then(() => {
  console.log('\n📋 SUMMARY:');

  if (!envStatus) {
    console.log('❌ ROOT CAUSE: Environment variables missing - R2 cannot connect');
  } else {
    console.log('✅ Environment variables set');
  }

  console.log('🔍 Next steps:');
  console.log('1. Verify .env file has correct R2 credentials');
  console.log('2. Check if Cloudflare R2 bucket exists and has photos');
  console.log('3. Test API endpoint manually');
  console.log('4. Check network connectivity');
  console.log('5. Review fallback logic in r2_service.ts');

  console.log('\n✨ Report Complete');
});
