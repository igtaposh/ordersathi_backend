import puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';
import path from 'path';

// Helper function to find Chrome executable paths
function findChromeExecutable() {
   const possiblePaths = [
      // Puppeteer's default paths
      '/opt/render/.cache/puppeteer/chrome/linux-*/chrome-linux64/chrome',
      // System Chrome paths
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      // Railway specific
      '/usr/bin/google-chrome-stable',
      // Heroku
      '/app/.chrome-for-testing/chrome-linux64/chrome'
   ];

   for (const chromePath of possiblePaths) {
      try {
         if (fs.existsSync(chromePath)) {
            console.log(`Found Chrome at: ${chromePath}`);
            return chromePath;
         }
      } catch (error) {
         // Handle glob patterns by checking if any files match
         if (chromePath.includes('*')) {
            try {
               const baseDir = chromePath.split('*')[0];
               if (fs.existsSync(baseDir)) {
                  const files = fs.readdirSync(baseDir);
                  for (const file of files) {
                     const fullPath = path.join(baseDir, file, 'chrome-linux64/chrome');
                     if (fs.existsSync(fullPath)) {
                        console.log(`Found Chrome at: ${fullPath}`);
                        return fullPath;
                     }
                  }
               }
            } catch (e) {
               continue;
            }
         }
      }
   }
   return null;
}

// Helper function to get browser configuration for different environments
async function getBrowserConfig() {
   const isProduction = process.env.NODE_ENV === 'production';

   const baseArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-extensions'
   ];

   const config = {
      headless: true,
      args: baseArgs
   };

   // Strategy 1: Use environment variable if provided
   if (process.env.CHROME_EXECUTABLE_PATH) {
      config.executablePath = process.env.CHROME_EXECUTABLE_PATH;
      console.log(`Using Chrome from env var: ${config.executablePath}`);
      return { config, useChromium: false };
   }

   // Strategy 2: In production, try different approaches
   if (isProduction) {
      // Try to find Chrome automatically
      const foundChrome = findChromeExecutable();
      if (foundChrome) {
         config.executablePath = foundChrome;
         console.log(`Found Chrome executable: ${foundChrome}`);
         return { config, useChromium: false };
      }

      // Strategy 3: Use Sparticuz Chromium as fallback
      try {
         const chromiumPath = await chromium.executablePath();
         console.log('Using Sparticuz Chromium as fallback');
         return {
            config: {
               headless: true,
               executablePath: chromiumPath,
               args: [...baseArgs, ...chromium.args]
            },
            useChromium: true
         };
      } catch (chromiumError) {
         console.log('Sparticuz Chromium not available, using default Puppeteer');
      }
   }

   // Strategy 4: Default Puppeteer (for local development)
   console.log('Using default Puppeteer Chrome');
   return { config, useChromium: false };
}

// Enhanced browser launcher with fallback strategies
async function launchBrowser() {
   const { config, useChromium } = await getBrowserConfig();

   console.log('Browser config:', JSON.stringify(config, null, 2));
   console.log('Using Chromium package:', useChromium);

   try {
      // Strategy 1: Try with the configured setup
      if (useChromium) {
         return await puppeteerCore.launch(config);
      } else {
         return await puppeteer.launch(config);
      }
   } catch (primaryError) {
      console.error('Primary browser launch failed:', primaryError.message);

      // Strategy 2: Fallback to Sparticuz Chromium
      try {
         console.log('Attempting fallback to Sparticuz Chromium...');
         const chromiumPath = await chromium.executablePath();
         const fallbackConfig = {
            headless: true,
            executablePath: chromiumPath,
            args: [
               '--no-sandbox',
               '--disable-setuid-sandbox',
               '--disable-dev-shm-usage',
               '--disable-gpu',
               ...chromium.args
            ]
         };
         return await puppeteerCore.launch(fallbackConfig);
      } catch (fallbackError) {
         console.error('Fallback browser launch failed:', fallbackError.message);

         // Strategy 3: Try minimal config
         console.log('Attempting minimal browser config...');
         try {
            return await puppeteer.launch({
               headless: true,
               args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
         } catch (minimalError) {
            console.error('Minimal browser launch failed:', minimalError.message);
            throw new Error(`All browser launch strategies failed. Primary: ${primaryError.message}, Fallback: ${fallbackError.message}, Minimal: ${minimalError.message}`);
         }
      }
   }
}

async function generatePDF(order, type = 'shopkeeper', shopName) {
   let browser;
   try {
      // 1. Build the HTML content dynamically
      const html = buildHTML(order, type, shopName);

      // 2. Launch browser with enhanced fallback strategy
      console.log('Launching browser for PDF generation...');
      browser = await launchBrowser();
      const page = await browser.newPage();

      // 3. Load HTML content
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // 4. Generate PDF buffer
      const pdfBuffer = await page.pdf({
         format: 'A4',
         printBackground: true,
         margin: { top: '40px', bottom: '60px', left: '30px', right: '30px' },
      });

      console.log('PDF generated successfully');
      return pdfBuffer;
   } catch (error) {
      console.error('PDF generation error:', error);
      console.error('Error stack:', error.stack);

      // Provide more specific error information
      if (error.message.includes('Browser was not found')) {
         throw new Error(`Chrome browser not found. Please ensure Chrome is installed. Original error: ${error.message}`);
      } else if (error.message.includes('Failed to launch')) {
         throw new Error(`Failed to launch browser. This might be due to missing dependencies. Original error: ${error.message}`);
      } else {
         throw new Error(`PDF generation failed: ${error.message}`);
      }
   } finally {
      if (browser) {
         try {
            await browser.close();
         } catch (closeError) {
            console.error('Error closing browser:', closeError);
         }
      }
   }
}

// 🔥 NEW: Stock Report PDF Generator
async function generateStockPDF(stockReport, shopName) {
   let browser;
   try {
      const html = buildStockHTML(stockReport, shopName);

      // Launch browser with enhanced fallback strategy
      console.log('Launching browser for Stock PDF generation...');
      browser = await launchBrowser();
      const page = await browser.newPage();

      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
         format: 'A4',
         printBackground: true,
         margin: { top: '40px', bottom: '60px', left: '30px', right: '30px' },
      });

      console.log('Stock PDF generated successfully');
      return pdfBuffer;
   } catch (error) {
      console.error('Stock PDF generation error:', error);
      console.error('Error stack:', error.stack);

      // Provide more specific error information
      if (error.message.includes('Browser was not found')) {
         throw new Error(`Chrome browser not found for stock PDF. Please ensure Chrome is installed. Original error: ${error.message}`);
      } else if (error.message.includes('Failed to launch')) {
         throw new Error(`Failed to launch browser for stock PDF. This might be due to missing dependencies. Original error: ${error.message}`);
      } else {
         throw new Error(`Stock PDF generation failed: ${error.message}`);
      }
   } finally {
      if (browser) {
         try {
            await browser.close();
         } catch (closeError) {
            console.error('Error closing browser for stock PDF:', closeError);
         }
      }
   }
}

// 🔧 HTML builder function
function buildHTML(order, type, shopName) {
   const styles = `
  <style>
      @page {
         margin: 5mm;
         size: A4;
         -webkit-print-color-adjust: exact;
         print-color-adjust: exact;
      }

      * {
         box-sizing: border-box;
         margin: 0;
         padding: 0;
      }

      body {
         font-family: 'Arial', sans-serif;
         font-size: 20px;
         line-height: 1.3;
         color: #000;
         background: white;
         -webkit-font-smoothing: antialiased;
         -moz-osx-font-smoothing: grayscale;
      }

      .pdf-content {
         width: 100%;
         max-width: 210mm;
         margin: 0 auto;
         background: white;
         position: relative;
      }

      .header-section {
         margin-bottom: 15px;
      }

      .header-frame {
         border: 2px solid #000;
         padding: 12px;
         background: #f9f9f9;
         
      }

      .header-top {
         display: flex;
         justify-content: space-between;
         align-items: center;
         margin-bottom: 12px;
         border-bottom: 1px solid #000;
         padding-bottom: 8px;
      }

      .company-info {
         text-align: left;
      }

      .company-name {
         font-size: 16px;
         font-weight: 700;
         margin: 0;
         letter-spacing: 0.5px;
         text-transform: uppercase;
      }

      .document-title {
         font-size: 11px;
         font-weight: 600;
         margin: 2px 0 0 0;
         text-transform: uppercase;
         color: #555;
      }

      .header-decoration {
         font-size: 16px;
         color: #000;
      }

      .order-details {
         display: grid;
         grid-template-columns: repeat(2, 1fr);
         gap: 10px;
         font-size: 10px;
      }

      .detail-item {
         text-align: center;
         padding: 6px;
         background: white;
         border: 1px solid #ccc;
      }

      .detail-label {
         font-size: 16px;
         font-weight: 600;
         text-transform: uppercase;
         color: #666;
         margin-bottom: 2px;
      }

      .detail-value {
         font-weight: 600;
         color: #000;
         font-size: 20px;
      }

      .content-section {
         margin: 15px 0;
      }

      table {
         width: 100%;
         border-collapse: collapse;
         margin-bottom: 12px;
         font-size: 18px;
        
      }

      .main-table {
         border: 2px solid #000;
         page-break-inside: auto;
      }

      .main-table th {
         background: #000;
         color: white;
         border: 1px solid #000;
         padding: 8px 4px;
         text-align: center;
         font-weight: 700;
         font-size: 18px;
         text-transform: uppercase;
      }

      .main-table td {
         border: 1px solid #333;
         padding: 6px 4px;
         text-align: center;
         font-size: 18px;
         font-weight: 500;
      }

      .main-table tbody tr:nth-child(even) {
         background-color: #f5f5f5;
      }

      .serial-cell {
         background: #000 !important;
         color: white;
         font-weight: 700;
      }

      .item-name {
         text-align: left !important;
         font-weight: 600;
         padding-left: 8px !important;
      }

      .amount-cell {
         font-weight: 700;
         text-align: right !important;
         padding-right: 8px !important;
      }

      .qty-cell {
         background: #e9e9e9 !important;
         font-weight: 600;
      }

      .rate-cell {
         font-weight: 600;
      }

      .summary-section {
         margin-top: 15px;
         display: flex;
         justify-content: flex-end;
      }

      .summary-table {
         width: 250px;
         border: 2px solid #000;
         font-size: 20px;
        
      }

      .summary-table th {
         background: #000;
         color: white;
         padding: 8px 12px;
         text-align: center;
         font-weight: 700;
         text-transform: uppercase;
      }

      .summary-table td {
         border: 1px solid #333;
         padding: 6px 12px;
         font-weight: 600;
         background: white;
      }

      .summary-table .label {
         text-align: left;
         border-right: 1px solid #000;
      }

      .summary-table .value {
         text-align: right;
         font-weight: 700;
      }

      .total-row {
         background: #f0f0f0 !important;
      }

      .footer-section {
         margin-top: 20px;
         padding-top: 12px;
         border-top: 1px solid #000;
         
      }

      .footer-branding {
         text-align: center;
         font-size: 16px;
         color: #555;
         line-height: 1.3;
      }

      .footer-branding p {
         margin: 2px 0;
      }

      .brand-name {
         font-weight: 700;
         color: #000;
      }

      .section-divider {
         text-align: center;
         margin: 8px 0;
         position: relative;
         font-size: 20px;
      }

      .section-divider::before,
      .section-divider::after {
         content: '';
         position: absolute;
         top: 50%;
         width: 35%;
         height: 1px;
         background: #000;
      }

      .section-divider::before {
         left: 0;
      }

      .section-divider::after {
         right: 0;
      }

      .section-divider span {
         background: white;
         padding: 0 10px;
         font-weight: 600;
         font-size: 18px;
      }

      /* Graphics and decorative elements */
      .corner-decoration {
         position: relative;
      }

      .corner-decoration::before {
         content: '';
         position: absolute;
         top: -3px;
         left: -3px;
         width: 12px;
         height: 12px;
         border-top: 2px solid #000;
         border-left: 2px solid #000;
      }

      .corner-decoration::after {
         content: '';
         position: absolute;
         bottom: -3px;
         right: -3px;
         width: 12px;
         height: 12px;
         border-bottom: 2px solid #000;
         border-right: 2px solid #000;
      }

      .decorative-border {
         border: 1px solid #ccc;
         position: relative;
      }

      .decorative-border::before {
         content: '';
         position: absolute;
         top: 3px;
         left: 3px;
         right: 3px;
         bottom: 3px;
         border: 1px solid #000;
         pointer-events: none;
      }

      .graphic-accent {
         display: inline-block;
         margin: 0 5px;
         font-weight: bold;
      }

      .table-decoration {
         position: relative;
      }

      .table-decoration::before {
         content: '▲';
         position: absolute;
         top: -8px;
         left: 50%;
         transform: translateX(-50%);
         font-size: 16px;
         color: #000;
      }

      .summary-decoration {
         position: relative;
         overflow: visible;
      }

      .summary-decoration::before {
         content: '◆';
         position: absolute;
         top: -5px;
         left: -5px;
         font-size: 20px;
         color: #000;
      }

      .summary-decoration::after {
         content: '◆';
         position: absolute;
         bottom: -5px;
         right: -5px;
         font-size: 20px;
         color: #000;
      }

      /* Print optimizations */
      @media print {
         body {
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
         }

         .pdf-content {
            box-shadow: none;
            border: none;
            margin: 0;
            padding: 20px;
         }

         .signature-section,
         .footer-section {
            page-break-inside: auto;
         }

         .corner-decoration::before,
         .corner-decoration::after,
         .summary-decoration::before,
         .summary-decoration::after,
         .table-decoration::before {
            display: none;
         }
      }
   </style>`;

   const rows = order.products.map((p, i) => {
      const pr = p.productId;
      if (type === 'shopkeeper') {
         const amount = pr.rate * p.quantity;
         return `
        <tr>
          <td>${i + 1}</td>
          <td class="product-name">${pr.name}</td>
          <td>₹${pr.rate}</td>
          <td>${pr.weight}</td>
          <td>${p.quantity} ${pr.type}</td>
          <td>₹${amount}</td>
        </tr>
      `;
      } else {
         return `
        <tr>
          <td>${i + 1}</td>
          <td class="product-name">${pr.name}</td>
          <td>${p.quantity} ${pr.type}</td>
          
        </tr>
      `;
      }
   }).join('');

   // round the total weight to 2 decimal places
   let num = order.totalWeight || 0;
   let rounded = Number(num.toFixed(2));

   const tableHeaders = type === 'shopkeeper'
      ? `<tr>
          <th style="width: 10%;">Sl No.</th>
          <th style="width: 35%;">Particulars</th>
          <th style="width: 15%;">Rate</th>
          <th style="width: 15%;">Weight</th>
          <th style="width: 10%;">Qty</th>
          <th style="width: 15%;">Amount</th>
       </tr>`
      : `<tr>
          
          <th style="width: 15%;">Sl No.</th>
          <th style="width: 70%;">Particulars</th>
          <th style="width: 15%;">Qty</th>
       </tr>`;

   const totalsRow = type === 'shopkeeper'
      ? `
      <div class="section-divider">
            <span>💰 SUMMARY</span>
         </div>

         <div class="summary-section">
            <table class="summary-table summary-decoration">
               <thead>
                  <tr>
                     <th colspan="2">📊 Order Summary</th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td class="label">📦 Total Weight:</td>
                     <td class="value">${rounded} Kg</td>
                  </tr>
                  
                  <tr class="total-row">
                     <td class="label"><strong>💰 Total Amount:</strong></td>
                     <td class="value"><strong>₹${order.totalAmount}</strong></td>
                  </tr>
               </tbody>
            </table>
         </div>
    `
      : '';

   return `

<html lang="en">

<head>
    ${styles}
</head>

<body>
   <div class="pdf-content">
      <div class="header-section">
         <div class="header-frame corner-decoration">
            <div class="header-top">
               <div class="company-info">
                  <div class="company-name">OrderSathi</div>
                  <div class="document-title">Order List (${type.toUpperCase()})</div>
               </div>
               <div class="header-decoration">
                  <span class="graphic-accent">◆</span>
                  <span class="graphic-accent">◇</span>
                  <span class="graphic-accent">◆</span>
               </div>
            </div>

            <div class="order-details">
               <div class="detail-item decorative-border">
                  <div class="detail-label">📅 Date</div>
                  <div class="detail-value">${new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
               </div>
               <div class="detail-item decorative-border">
                  <div class="detail-label">👤 Created By</div>
                  <div class="detail-value">${shopName.shopName}</div>
               </div>
            </div>
         </div>
      </div>
      <div class="content-section">
         <div class="section-divider">
            <span>📦 PRODUCT DETAILS</span>
         </div>

         <table class="main-table table-decoration">
            <thead>
            ${tableHeaders}
               
            </thead>
            <tbody>
               ${rows}
            </tbody>
         </table>

         
      </div>
      ${totalsRow}

      <div class="footer-section">
         <div class="section-divider">
            <span>⚡ POWERED BY</span>
         </div>

         <div class="footer-branding">
            <p>🚀 Generated by <span class="brand-name">OrderSathi.in</span> - Professional Order Management System</p>
            <p>📅 This document was auto-generated on ${new Date().toLocaleString('en-IN')}</p>
            <p>🌐 For support, visit www.ordersathi.in or contact support@ordersathi.in</p>
         </div>
      </div>
   </div>
   <script>
      // PDF optimization script
      window.addEventListener('load', function () {
         // Ensure all fonts are loaded before PDF generation
         if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () {
               console.log('All fonts loaded');
            });
         }
      });
   </script>
</body>

</html>
  `;
}

function buildStockHTML(stockReport, shopName) {
   const styles = `
  <style>
      @page {
         margin: 5mm;
         size: A4;
         -webkit-print-color-adjust: exact;
         print-color-adjust: exact;
      }

      * {
         box-sizing: border-box;
         margin: 0;
         padding: 0;
      }

      body {
         font-family: 'Arial', sans-serif;
         font-size: 10px;
         line-height: 1.3;
         color: #000;
         background: white;
         -webkit-font-smoothing: antialiased;
         -moz-osx-font-smoothing: grayscale;
      }

      .pdf-content {
         width: 100%;
         max-width: 210mm;
         margin: 0 auto;
         background: white;
         position: relative;
      }

      .header-section {
         margin-bottom: 15px;
      }

      .header-frame {
         border: 2px solid #000;
         padding: 12px;
         background: #f9f9f9;
         
      }

      .header-top {
         display: flex;
         justify-content: space-between;
         align-items: center;
         margin-bottom: 12px;
         border-bottom: 1px solid #000;
         padding-bottom: 8px;
      }

      .company-info {
         text-align: left;
      }

      .company-name {
         font-size: 16px;
         font-weight: 700;
         margin: 0;
         letter-spacing: 0.5px;
         text-transform: uppercase;
      }

      .document-title {
         font-size: 11px;
         font-weight: 600;
         margin: 2px 0 0 0;
         text-transform: uppercase;
         color: #555;
      }

      .header-decoration {
         font-size: 16px;
         color: #000;
      }

      .order-details {
         display: grid;
         grid-template-columns: repeat(2, 1fr);
         gap: 10px;
         font-size: 15px;
      }

      .detail-item {
         text-align: center;
         padding: 6px;
         background: white;
         border: 1px solid #ccc;
      }

      .detail-label {
         font-size: 12px;
         font-weight: 600;
         text-transform: uppercase;
         color: #666;
         margin-bottom: 2px;
      }

      .detail-value {
         font-weight: 600;
         color: #000;
         font-size: 15px;
      }

      .content-section {
         margin: 15px 0;
      }

      table {
         width: 100%;
         border-collapse: collapse;
         margin-bottom: 12px;
         font-size: 13px;
        
      }

      .main-table {
         border: 2px solid #000;
         page-break-inside: auto;
      }

      .main-table th {
         background: #000;
         color: white;
         border: 1px solid #000;
         padding: 8px 4px;
         text-align: center;
         font-weight: 700;
         font-size: 13px;
         text-transform: uppercase;
      }

      .main-table td {
         border: 1px solid #333;
         padding: 6px 4px;
         text-align: center;
         font-size: 18px;
         font-weight: 500;
      }

      .main-table tbody tr:nth-child(even) {
         background-color: #f5f5f5;
      }

      .serial-cell {
         background: #000 !important;
         color: white;
         font-weight: 700;
      }

      .product-name {
         text-align: left !important;
         font-weight: 600;
         padding-left: 8px !important;
      }

      .amount-cell {
         font-weight: 700;
         text-align: right !important;
         padding-right: 8px !important;
      }

      .qty-cell {
         background: #e9e9e9 !important;
         font-weight: 600;
      }

      .rate-cell {
         font-weight: 600;
      }

      .summary-section {
         margin-top: 15px;
         display: flex;
         justify-content: flex-end;
      }

      .summary-table {
         width: 250px;
         border: 2px solid #000;
         font-size: 15px;
        
      }

      .summary-table th {
         background: #000;
         color: white;
         padding: 8px 12px;
         text-align: center;
         font-weight: 700;
         text-transform: uppercase;
      }

      .summary-table td {
         border: 1px solid #333;
         padding: 6px 12px;
         font-weight: 600;
         background: white;
      }

      .summary-table .label {
         text-align: left;
         border-right: 1px solid #000;
      }

      .summary-table .value {
         text-align: right;
         font-weight: 700;
      }

      .total-row {
         background: #f0f0f0 !important;
      }

      .footer-section {
         margin-top: 20px;
         padding-top: 12px;
         border-top: 1px solid #000;
         
      }

      .footer-branding {
         text-align: center;
         font-size: 12px;
         color: #555;
         line-height: 1.3;
      }

      .footer-branding p {
         margin: 2px 0;
      }

      .brand-name {
         font-weight: 700;
         color: #000;
      }

      .section-divider {
         text-align: center;
         margin: 8px 0;
         position: relative;
         font-size: 15px;
      }

      .section-divider::before,
      .section-divider::after {
         content: '';
         position: absolute;
         top: 50%;
         width: 35%;
         height: 1px;
         background: #000;
      }

      .section-divider::before {
         left: 0;
      }

      .section-divider::after {
         right: 0;
      }

      .section-divider span {
         background: white;
         padding: 0 10px;
         font-weight: 600;
         font-size: 13px;
      }

      /* Graphics and decorative elements */
      .corner-decoration {
         position: relative;
      }

      .corner-decoration::before {
         content: '';
         position: absolute;
         top: -3px;
         left: -3px;
         width: 12px;
         height: 12px;
         border-top: 2px solid #000;
         border-left: 2px solid #000;
      }

      .corner-decoration::after {
         content: '';
         position: absolute;
         bottom: -3px;
         right: -3px;
         width: 12px;
         height: 12px;
         border-bottom: 2px solid #000;
         border-right: 2px solid #000;
      }

      .decorative-border {
         border: 1px solid #ccc;
         position: relative;
      }

      .decorative-border::before {
         content: '';
         position: absolute;
         top: 3px;
         left: 3px;
         right: 3px;
         bottom: 3px;
         border: 1px solid #000;
         pointer-events: none;
      }

      .graphic-accent {
         display: inline-block;
         margin: 0 5px;
         font-weight: bold;
      }

      .table-decoration {
         position: relative;
      }

      .table-decoration::before {
         content: '▲';
         position: absolute;
         top: -8px;
         left: 50%;
         transform: translateX(-50%);
         font-size: 16px;
         color: #000;
      }

      .summary-decoration {
         position: relative;
         overflow: visible;
      }

      .summary-decoration::before {
         content: '◆';
         position: absolute;
         top: -5px;
         left: -5px;
         font-size: 20px;
         color: #000;
      }

      .summary-decoration::after {
         content: '◆';
         position: absolute;
         bottom: -5px;
         right: -5px;
         font-size: 10px;
         color: #000;
      }

      /* Print optimizations */
      @media print {
         body {
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
         }

         .pdf-content {
            box-shadow: none;
            border: none;
            margin: 0;
         }

         .signature-section,
         .footer-section {
            page-break-inside: auto;
         }

         .corner-decoration::before,
         .corner-decoration::after,
         .summary-decoration::before,
         .summary-decoration::after,
         .table-decoration::before {
            display: none;
         }
      }
   </style>`;

   // FIX: Use stockReport.products.map(...)
   const rows = stockReport.products.map((p, i) => {
      const pr = p.productId;
      return `
      <tr>
          <td>${i + 1}</td>
          <td class="product-name">${pr.name}</td>
          <td>${p.quantity > 0 ? `${p.quantity} ${pr.type}` : 'Nil'}</td>
      </tr>
    `;
   }).join('');

   return `
    
<head>
    ${styles}
</head>

<body>
   <div class="pdf-content">
      <div class="header-section">
         <div class="header-frame corner-decoration">
            <div class="header-top">
               <div class="company-info">
                  <div class="company-name">OrderSathi</div>
                  <div class="document-title">Stock Report</div>
               </div>
               <div class="header-decoration">
                  <span class="graphic-accent">◆</span>
                  <span class="graphic-accent">◇</span>
                  <span class="graphic-accent">◆</span>
               </div>
            </div>

            <div class="order-details">
               <div class="detail-item decorative-border">
                  <div class="detail-label">📅 Date</div>
                  <div class="detail-value">${new Date(stockReport.createdAt).toLocaleDateString('en-IN')}</div>
               </div>
               <div class="detail-item decorative-border">
                  <div class="detail-label">👤 Created By</div>
                  <div class="detail-value">${shopName.shopName}</div>
               </div>
            </div>
         </div>
      </div>
      <div class="content-section">
         <div class="section-divider">
            <span>📦 PRODUCT DETAILS</span>
         </div>

         <table class="main-table table-decoration">
            <thead>
            <tr>
          
          <th style="width: 7%;">Sl No.</th>
          <th style="width: 36%;">Particulars</th>
          <th style="width: 7%;">Stock</th>
       </tr>
               
            </thead>
            <tbody>
               ${rows}
            </tbody>
         </table>

         
      </div>
      

      <div class="footer-section">
         <div class="section-divider">
            <span>⚡ POWERED BY</span>
         </div>

         <div class="footer-branding">
            <p>🚀 Generated by <span class="brand-name">OrderSathi.in</span> - Professional Order Management System</p>
            <p>📅 This document was auto-generated on ${new Date().toLocaleString()}</p>
            <p>🌐 For support, visit www.ordersathi.in or contact support@ordersathi.in</p>
         </div>
      </div>
   </div>
   <script>
      // PDF optimization script
      window.addEventListener('load', function () {
         // Ensure all fonts are loaded before PDF generation
         if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () {
               console.log('All fonts loaded');
            });
         }
      });
   </script>
</body>

</html>
  `;
}

export default generatePDF;
export { generateStockPDF, generatePDF };
