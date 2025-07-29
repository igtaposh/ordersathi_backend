/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
   // Download Chrome during npm install
   skipDownload: false,

   // Cache directory for Puppeteer
   cacheDirectory: process.env.PUPPETEER_CACHE_DIR || './node_modules/.cache/puppeteer',

   // Default browser to use
   defaultBrowser: 'chrome',
};
