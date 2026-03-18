#!/bin/bash

echo "🚀 Starting EAS Build Process for Kronop App"

# Check if EAS is configured
echo "📋 Checking EAS configuration..."
if [ ! -f ".eas/project.json" ]; then
    echo "❌ EAS project not configured. Please run:"
    echo "   npx eas init"
    echo "   Then select the existing project: @kronopaman/kronop"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Fix Expo versions
echo "🔧 Fixing Expo versions..."
npx expo install --fix

# Build Android Development
echo "🤖 Building Android Development Build..."
npx eas build --platform android --profile development

# Build iOS Development
echo "🍎 Building iOS Development Build..."
npx eas build --platform ios --profile development

echo "✅ Build process completed!"
