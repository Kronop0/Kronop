#!/usr/bin/env node
/**
 * Setup Hermes compiler for React Native
 * This script ensures Hermes is properly downloaded for EAS builds
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const HERMES_DIR = path.join(__dirname, '..', 'node_modules', 'react-native', 'sdks', 'hermesc', 'linux64-bin');
const HERMES_BIN = path.join(HERMES_DIR, 'hermesc');

// Hermes version mapping for React Native versions
const HERMES_VERSIONS = {
  '0.83.0': '0.12.0',
  '0.83.1': '0.12.0',
  '0.83.2': '0.12.0',
  '0.83.3': '0.12.0',
  '0.83.4': '0.12.0',
};

function getReactNativeVersion() {
  try {
    const packageJson = require('../package.json');
    const rnVersion = packageJson.dependencies['react-native'];
    // Remove ^, ~, or other semver prefixes
    return rnVersion.replace(/^[\^~]/, '');
  } catch (e) {
    console.warn('Could not determine React Native version');
    return '0.83.4';
  }
}

function getHermesVersion(rnVersion) {
  // Extract major.minor.patch
  const match = rnVersion.match(/^(\d+\.\d+\.\d+)/);
  if (!match) return '0.12.0';
  
  const baseVersion = match[1];
  return HERMES_VERSIONS[baseVersion] || '0.12.0';
}

function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { timeout: 60000 }, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        file.close();
        fs.unlinkSync(dest);
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function setupHermes() {
  console.log('Setting up Hermes compiler...');

  // Check if hermesc already exists and is executable
  if (fs.existsSync(HERMES_BIN)) {
    try {
      fs.accessSync(HERMES_BIN, fs.constants.X_OK);
      console.log('Hermes compiler already exists and is executable');
      
      // Verify it works
      try {
        const output = execSync(`${HERMES_BIN} --version`, { encoding: 'utf-8', timeout: 5000 });
        console.log(`Hermes version: ${output.trim()}`);
        return;
      } catch (e) {
        console.warn('Existing hermesc may be corrupted, will re-download');
      }
    } catch (e) {
      console.log('Hermes exists but is not executable, fixing permissions...');
      fs.chmodSync(HERMES_BIN, 0o755);
      return;
    }
  }

  ensureDirectoryExists(HERMES_DIR);

  const rnVersion = getReactNativeVersion();
  const hermesVersion = getHermesVersion(rnVersion);
  
  console.log(`React Native version: ${rnVersion}`);
  console.log(`Hermes version: ${hermesVersion}`);

  // Try to download from React Native's artifact repository
  const downloadUrls = [
    // React Native's own Hermes builds
    `https://registry.npmjs.org/react-native/-/react-native-${rnVersion}.tgz`,
    // Hermes GitHub releases
    `https://github.com/facebook/hermes/releases/download/v${hermesVersion}/hermes-cli-linux-v${hermesVersion}.tar.gz`,
    // Fallback to specific Hermes releases
    `https://github.com/facebook/hermes/releases/download/v0.12.0/hermes-cli-linux-v0.12.0.tar.gz`,
  ];

  let downloaded = false;
  
  for (const url of downloadUrls) {
    try {
      console.log(`Attempting to download from: ${url}`);
      const tempFile = path.join(HERMES_DIR, 'temp-download.tar.gz');
      
      await downloadFile(url, tempFile);
      
      // If it's the npm package, we need to extract differently
      if (url.includes('registry.npmjs.org')) {
        // Extract the npm tarball and find hermesc
        const extractDir = path.join(HERMES_DIR, 'temp-extract');
        ensureDirectoryExists(extractDir);
        
        execSync(`tar -xzf "${tempFile}" -C "${extractDir}"`, { stdio: 'pipe' });
        
        // Look for hermesc in the extracted package
        const possiblePaths = [
          path.join(extractDir, 'package', 'sdks', 'hermesc', 'linux64-bin', 'hermesc'),
          path.join(extractDir, 'sdks', 'hermesc', 'linux64-bin', 'hermesc'),
        ];
        
        for (const hermesPath of possiblePaths) {
          if (fs.existsSync(hermesPath)) {
            fs.copyFileSync(hermesPath, HERMES_BIN);
            fs.chmodSync(HERMES_BIN, 0o755);
            console.log('Hermes compiler extracted successfully');
            downloaded = true;
            break;
          }
        }
        
        // Cleanup
        fs.rmSync(extractDir, { recursive: true, force: true });
      } else {
        // Direct Hermes CLI download - extract
        execSync(`tar -xzf "${tempFile}" -C "${HERMES_DIR}"`, { stdio: 'pipe' });
        
        // Find the hermesc binary in extracted files
        const files = fs.readdirSync(HERMES_DIR);
        const hermesBinary = files.find(f => f === 'hermesc');
        
        if (hermesBinary) {
          fs.chmodSync(path.join(HERMES_DIR, hermesBinary), 0o755);
          downloaded = true;
          console.log('Hermes compiler downloaded and extracted successfully');
        }
      }
      
      // Cleanup temp file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      
      if (downloaded) break;
      
    } catch (error) {
      console.warn(`Failed to download from ${url}: ${error.message}`);
    }
  }

  if (!downloaded) {
    console.warn('Could not download Hermes compiler automatically.');
    console.warn('Creating placeholder - the build may fail if React Native cannot find Hermes.');
    
    // Create a placeholder that will fail gracefully
    const placeholder = `#!/bin/bash
# Placeholder Hermes compiler
# React Native should replace this during the build process
echo "Warning: Using placeholder hermesc" >&2
exit 1
`;
    fs.writeFileSync(HERMES_BIN, placeholder);
    fs.chmodSync(HERMES_BIN, 0o755);
  }

  console.log('Hermes setup completed');
}

// Run setup
setupHermes().catch(err => {
  console.error('Error setting up Hermes:', err.message);
  process.exit(1);
});
