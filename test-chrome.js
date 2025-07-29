#!/usr/bin/env node

// Simple script to test Chrome installation and Puppeteer setup
import puppeteer from 'puppeteer';
import fs from 'fs';

console.log('🔍 Testing Chrome installation and Puppeteer setup...\n');

// Test 1: Check if Chrome is installed by Puppeteer
console.log('1. Checking Puppeteer cache directory...');
const cacheDir = process.env.PUPPETEER_CACHE_DIR || './node_modules/.cache/puppeteer';
console.log(`Cache directory: ${cacheDir}`);

if (fs.existsSync(cacheDir)) {
   console.log('✅ Puppeteer cache directory exists');
   try {
      const contents = fs.readdirSync(cacheDir);
      console.log('Cache contents:', contents);
   } catch (e) {
      console.log('Could not read cache contents:', e.message);
   }
} else {
   console.log('❌ Puppeteer cache directory not found');
}

// Test 2: Try to launch browser
console.log('\n2. Testing browser launch...');
try {
   const browser = await puppeteer.launch({
      headless: true,
      args: [
         '--no-sandbox',
         '--disable-setuid-sandbox',
         '--disable-dev-shm-usage',
         '--disable-gpu'
      ]
   });

   console.log('✅ Browser launched successfully!');
   const version = await browser.version();
   console.log(`Browser version: ${version}`);

   const page = await browser.newPage();
   await page.setContent('<h1>Test PDF</h1>');

   console.log('✅ Page created and content set successfully!');

   await browser.close();
   console.log('✅ Browser closed successfully!');

   console.log('\n🎉 All tests passed! Puppeteer is working correctly.');
} catch (error) {
   console.log('❌ Browser launch failed:');
   console.log('Error message:', error.message);
   console.log('Error stack:', error.stack);

   console.log('\n💡 Troubleshooting suggestions:');
   console.log('1. Run: npx puppeteer browsers install chrome');
   console.log('2. Check if Chrome dependencies are installed');
   console.log('3. Ensure sufficient disk space and memory');
   process.exit(1);
}
