const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\Users\\jewel\\OneDrive\\Documents\\app';

// Create directories
const dirs = [
  'app\\auth\\login',
  'app\\auth\\register',
  'app\\auth\\forgot-password',
  'app\\guest\\browse',
  'app\\admin\\dashboard',
  'app\\admin\\auth\\login',
  'app\\admin\\auth\\register',
  'app\\renter\\my-rentals'
];

dirs.forEach(d => {
  const fullPath = path.join(baseDir, d);
  fs.mkdirSync(fullPath, { recursive: true });
  console.log(`Created: ${fullPath}`);
});

// Copy/rename files
const copies = [
  { from: 'auth\\login\\page.tsx', to: 'app\\auth\\login\\page.tsx' },
  { from: 'auth\\register_page.tsx', to: 'app\\auth\\register\\page.tsx' },
  { from: 'guest\\browse_page.tsx', to: 'app\\guest\\browse\\page.tsx' },
];

copies.forEach(({ from, to }) => {
  const fromPath = path.join(baseDir, from);
  const toPath = path.join(baseDir, to);
  if (fs.existsSync(fromPath)) {
    fs.copyFileSync(fromPath, toPath);
    console.log(`Copied: ${from} -> ${to}`);
  } else {
    console.log(`File not found: ${from}`);
  }
});

console.log('Migration complete!');
