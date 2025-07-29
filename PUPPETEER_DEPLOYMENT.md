# Puppeteer Deployment Guide

## Production Environment Setup

### For Render.com:
1. Add these environment variables in your Render dashboard:
   ```
   NODE_ENV=production
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
   ```

2. Add build command in Render:
   ```
   npm install && npx puppeteer browsers install chrome
   ```

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
