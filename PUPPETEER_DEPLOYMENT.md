# Puppeteer Deployment Guide - Multi-Strategy Approach

## What's New:
- **Enhanced PDF Generator** with 3-tier fallback strategy
- **Sparticuz Chromium** as reliable backup
- **Automatic Chrome detection** for different platforms
- **Comprehensive error handling** and logging

## Production Environment Setup

### For Render.com (Multiple Strategies):

#### Strategy 1: Using render.yaml (Recommended)
1. **Use the provided `render.yaml` file** in your project root
2. **Deploy directly** - Render will use the configuration automatically
3. **Environment Variables** (already in render.yaml):
   ```
   NODE_ENV=production
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
   PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
   ```

#### Strategy 2: Manual Render Dashboard Setup
1. **Build Command**: 
   ```
   cd Backend && npm install && npx puppeteer browsers install chrome
   ```

2. **Start Command**:
   ```
   cd Backend && npm start
   ```

3. **Environment Variables**:
   ```
   NODE_ENV=production
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
   ```

#### Strategy 3: Fallback (if Chrome installation fails)
The enhanced PDF generator will automatically fall back to:
1. **Sparticuz Chromium** (lightweight, reliable)
2. **Minimal Puppeteer config** (last resort)

## How the Enhanced System Works:

### Tier 1: Environment-Specific Chrome
- Checks `CHROME_EXECUTABLE_PATH` environment variable
- Searches common Chrome installation paths

### Tier 2: Sparticuz Chromium Fallback
- Uses `@sparticuz/chromium` package
- Optimized for serverless/cloud environments
- Smaller footprint, more reliable

### Tier 3: Minimal Puppeteer
- Basic Puppeteer launch as last resort
- Minimal configuration for maximum compatibility

## Debugging in Production:

### Check Logs:
Look for these messages in your production logs:
```
✅ "Using Chrome from env var: /path/to/chrome"
✅ "Found Chrome executable: /path/to/chrome"
✅ "Using Sparticuz Chromium as fallback"
✅ "Using default Puppeteer Chrome"
```

### Error Messages:
- If you see "All browser launch strategies failed" - contact support
- Check for memory/disk space issues
- Verify all dependencies are installed

## Testing:
Run locally: `npm run test-chrome`
This will verify your setup works before deployment.

### For Railway:
1. Add environment variable:
   ```
   CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
   ```

2. Create `nixpacks.toml` in your root directory:
   ```toml
   [phases.setup]
   nixPkgs = ['nodejs', 'chromium']
   
   [phases.install]
   cmds = ['npm install', 'npx puppeteer browsers install chrome']
   ```

### For Heroku:
1. Add these buildpacks:
   ```
   heroku buildpacks:add jontewks/puppeteer
   heroku buildpacks:add heroku/nodejs
   ```

2. Add environment variables:
   ```
   NODE_ENV=production
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
   ```

### For Docker:
Add to your Dockerfile:
```dockerfile
# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    --no-install-recommends

# Install Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install Puppeteer and Chrome
RUN npm install && npx puppeteer browsers install chrome
```

### For Vercel (Alternative approach):
If you're using Vercel, consider using `@vercel/og` or `puppeteer-core` with `chrome-aws-lambda`.

## Testing Locally:
Run this command to test if Chrome is properly installed:
```bash
npx puppeteer browsers install chrome
node -e "const puppeteer = require('puppeteer'); puppeteer.launch().then(browser => { console.log('Chrome installed successfully!'); browser.close(); });"
```
