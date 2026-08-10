const fs = require('fs');
const path = require('path');

// Ensure dist-electron directory exists
const distElectron = path.join(__dirname, 'dist-electron');
if (!fs.existsSync(distElectron)) {
  fs.mkdirSync(distElectron, { recursive: true });
}
console.log('Electron build output directory ready.');
