#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Starting Netlify build process...');

// Ensure public directory exists
const publicDir = path.join(__dirname, '..', '..', 'app', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('Created public directory');
}

// Check static files in public directory
const staticFiles = [
  { src: '../../app/public/index.html', name: 'index.html' },
  { src: '../../app/public/js/app.js', name: 'app.js' },
  { src: '../../app/public/css/style.css', name: 'style.css' },
  { src: '../../app/public/favicon.ico', name: 'favicon.ico' }
];

staticFiles.forEach(file => {
  const srcPath = path.join(__dirname, file.src);
  
  if (fs.existsSync(srcPath)) {
    console.log(`✓ ${file.name} exists at ${file.src}`);
  } else {
    console.log(`✗ ${file.name} missing at ${file.src}`);
  }
});

// Check assets directory
const assetsDir = path.join(__dirname, '..', '..', 'app', 'public', 'assets');
if (fs.existsSync(assetsDir)) {
  console.log('✓ Assets directory exists');
  const iconPath = path.join(assetsDir, 'icon.svg');
  if (fs.existsSync(iconPath)) {
    console.log('✓ Icon file exists');
  }
} else {
  console.log('✗ Assets directory missing');
}

// Ensure netlify functions directory exists
const functionsDir = path.join(__dirname, '..', 'netlify', 'functions');
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(functionsDir, { recursive: true });
  console.log('Created netlify/functions directory');
}

// Check if serverless function exists
const apiFunction = path.join(functionsDir, 'api.js');
if (fs.existsSync(apiFunction)) {
  console.log('✓ Serverless API function exists');
} else {
  console.log('✗ Serverless API function missing');
}

console.log('Netlify build process completed!');
console.log('\nNext steps:');
console.log('1. Set environment variables in Netlify dashboard');
console.log('2. Configure build settings: Build command = "node deployment/scripts/build-netlify.js && npm run build"');
console.log('3. Set publish directory to "app/public"');
console.log('4. Deploy!');