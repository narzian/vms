// Direct Vite launcher to avoid Node.js permission issues
const { spawn } = require('child_process');
const path = require('path');

// Path to the Vite executable in node_modules
const viteBinPath = path.join(__dirname, 'node_modules', '.bin', 'vite.cmd');

console.log('Starting Vite directly from:', viteBinPath);

// Start Vite as a child process
const viteProcess = spawn(viteBinPath, [], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Set custom paths to avoid AppData access
    HOME: path.join(__dirname, '.node_home'),
    APPDATA: path.join(__dirname, '.node_appdata'),
    LOCALAPPDATA: path.join(__dirname, '.node_localappdata'),
    NODE_ENV: 'development'
  }
});

viteProcess.on('error', (err) => {
  console.error('Failed to start Vite:', err);
});

viteProcess.on('close', (code) => {
  console.log(`Vite process exited with code ${code}`);
}); 