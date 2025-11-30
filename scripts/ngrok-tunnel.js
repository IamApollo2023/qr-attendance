/**
 * ngrok tunnel script for Windows compatibility
 * This script attempts to use ngrok via multiple methods
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function startNgrok() {
  console.log('🚀 Starting ngrok tunnel...\n');
  
  // Try different methods to find ngrok
  const ngrokCommands = [
    'ngrok http 3000',  // Global installation
    'npx -y @ngrok/ngrok@latest http 3000',  // Official package
    'node_modules/.bin/ngrok http 3000',  // Local installation
  ];

  for (const cmd of ngrokCommands) {
    try {
      console.log(`Trying: ${cmd}`);
      const { stdout, stderr } = await execAsync(cmd, {
        cwd: process.cwd(),
        env: { ...process.env, NGROK_AUTHTOKEN: process.env.NGROK_AUTHTOKEN }
      });
      
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      
      // If we get here, ngrok started successfully
      return;
    } catch (error) {
      // Continue to next method
      continue;
    }
  }

  // If all methods fail, provide instructions
  console.error('\n❌ Could not start ngrok automatically.\n');
  console.log('📋 Manual setup required:\n');
  console.log('Option 1: Download ngrok directly');
  console.log('  1. Go to https://ngrok.com/download');
  console.log('  2. Download ngrok for Windows');
  console.log('  3. Extract and add to PATH, or place in project root');
  console.log('  4. Run: ngrok config add-authtoken YOUR_TOKEN');
  console.log('  5. Then run: ngrok http 3000\n');
  console.log('Option 2: Use Chocolatey (if installed)');
  console.log('  choco install ngrok\n');
  console.log('Option 3: Run manually in separate terminal:');
  console.log('  ngrok http 3000\n');
  
  process.exit(1);
}

startNgrok().catch(console.error);



