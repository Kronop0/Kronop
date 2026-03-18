const { spawn } = require('child_process');
const fs = require('fs');

// Force project ID in app.json
const appJsonPath = './app.json';
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
appJson.extra.eas.projectId = '61a99a9f-ea90-4fa5-aaec-132e2d8bb76c';
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

// Build with forced configuration
const build = spawn('npx', ['eas', 'build', '--platform', 'android', '--profile', 'development'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    EAS_PROJECT_ID: '61a99a9f-ea90-4fa5-aaec-132e2d8bb76c',
    NODE_ENV: 'production'
  }
});

build.on('close', (code) => {
  console.log(`Build process exited with code ${code}`);
});
