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

async function generatePDF(order, type = 'shopkeeper') {
  let browser;
  try {
    // 1. Build the HTML content dynamically
    const html = buildHTML(order, type);

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
async function generateStockPDF(stockReport) {
  let browser;
  try {
    const html = buildStockHTML(stockReport);

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
function buildHTML(order, type) {
  const styles = `
    <style>
      body { font-family: Arial, sans-serif; padding: 10px; }
      .pdf-body {
        position: relative;
      }
      h1 { text-align: center; font-size: 20px; margin-bottom: 10px; }
      
      .order-info{
        margin-bottom: 50px;
        font-size: 18px;
        line-height: 0.5;
        width: 100%;
        text-align: center;
        justify-content: center;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 6px;
        text-align: center;
      }
      .product-name{
        text-align: start !important;
      }
      tfoot td {
        font-weight: bold;
      }
      .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 10px;
        color: gray;
        position: absolute;
        bottom: 0;
        width: 100%;

      }
    </style>
  `;

  const rows = order.products.map((p, i) => {
    const pr = p.productId;
    if (type === 'shopkeeper') {
      const amount = pr.rate * p.quantity;
      return `
        <tr>
          <td>${i + 1}</td>
          <td class="product-name">${pr.name}</td>
          <td>₹${pr.mrp}</td>
          <td>₹${pr.rate}</td>
          <td>${pr.type}</td>
          <td>${pr.weight}</td>
          <td>${p.quantity}</td>
          <td>₹${amount}</td>
        </tr>
      `;
    } else {
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${pr.name}</td>
          <td>${pr.mrp}</td>
          <td>${p.quantity}</td>
          <td>${pr.type}</td>
        </tr>
      `;
    }
  }).join('');

  const tableHeaders = type === 'shopkeeper'
    ? `<tr><th>Sl No</th><th>Particulars</th><th>MRP</th><th>Rate</th><th>Type</th><th>Weight</th><th>Qty</th><th>Amount</th></tr>`
    : `<tr><th>Sl No</th><th>Product</th><th>MRP</th><th>Qty</th><th>Type</th></tr>`;

  const totalsRow = type === 'shopkeeper'
    ? `
      <tfoot>
        <tr>
          <td colspan="7">Total Amount</td>
          <td>₹${order.totalAmount}</td>
        </tr>
        <tr>
          <td colspan="7">Total Weight</td>
          <td>${order.totalWeight} Kg</td>
        </tr>
      </tfoot>
    `
    : '';

  return `
    <html>
    <head>
      ${styles}
    </head>
    <body class="pdf-body">
    <div>
      <h1>ORDER LIST (${type.toUpperCase()})</h1>
      <div class="order-info">
      <p>Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
      <p>Created By: CDFS</p>
      <p>Supplier: ${order.supplierId.name}</p>
      </div>

      <table>
        <thead>${tableHeaders}</thead>
        <tbody>${rows}</tbody>
        ${totalsRow}
      </table>

      <div class="footer">
        Generated with 💡 OrderSathi.in<br/>
        Your order summary was created in seconds — just by entering product quantities.<br/>
        Ready to simplify your workflow? Try it now at www.ordersathi.in
      </div>
    </div>
    </body>
    </html>
  `;
}

function buildStockHTML(stockReport) {
  const styles = `
    <style>
      body { font-family: Arial, sans-serif; padding: 10px; }
      .pdf-body { position: relative; }
      h1 { text-align: center; font-size: 20px; margin-bottom: 10px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 6px; text-align: center; }
      .product-name { text-align: start !important; }
      tfoot td { font-weight: bold; }
      .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 10px;
        color: gray;
        position: absolute;
        bottom: 0;
        width: 100%;
      }
    </style>
  `;

  // FIX: Use stockReport.products.map(...)
  const rows = stockReport.products.map((p, i) => {
    const pr = p.productId;
    return `
      <tr>
        <td>${i + 1}</td>
        <td class="product-name">${pr?.name || ''}</td>
        <td>₹${pr?.mrp || ''}</td>
        <td>${p.quantity ?? '-'}</td>
        <td>${pr?.type || ''}</td>
        
      </tr>
    `;
  }).join('');

  return `
    <html>
    <head>${styles}</head>
    <body class="pdf-body">
      <div>
        <h1>STOCK REPORT</h1>
        <div class="order-info">
          <p>Date: ${new Date(stockReport.createdAt).toLocaleDateString('en-IN')}</p>
          <p>Supplier: ${stockReport.supplierId?.name || 'Unknown'}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Sl No</th>
              <th>Product</th>
              <th>MRP</th>
              <th>Stock</th>
              <th>Type</th>

            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div class="footer">
          Generated with 💡 OrderSathi.in<br/>
          Your stock report was created in seconds.<br/>
          Try it now at www.ordersathi.in
        </div>
      </div>
    </body>
    </html>
  `;
}

export default generatePDF;
export { generateStockPDF, generatePDF };
