import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function generatePDF(order, type = 'shopkeeper') {
  // 1. Build the HTML content dynamically
  const html = buildHTML(order, type);

  // 2. Launch puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // 3. Load HTML content
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // 4. Generate PDF buffer
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '40px', bottom: '60px', left: '30px', right: '30px' },
  });

  await browser.close();
  return pdfBuffer;
}

// 🔥 NEW: Stock Report PDF Generator
async function generateStockPDF(stockReport) {
  const html = buildStockHTML(stockReport);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '40px', bottom: '60px', left: '30px', right: '30px' },
  });
  await browser.close();
  return pdfBuffer;
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
          <td>${pr.type}</td>
          <td>${p.quantity}</td>
        </tr>
      `;
    }
  }).join('');

  const tableHeaders = type === 'shopkeeper'
    ? `<tr><th>Sl No</th><th>Particulars</th><th>MRP</th><th>Rate</th><th>Type</th><th>Weight</th><th>Qty</th><th>Amount</th></tr>`
    : `<tr><th>Sl No</th><th>Product</th><th>Type</th><th>Qty</th></tr>`;

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
        <td>${pr?.weight || ''}</td>
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
              <th>Weight</th>
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
