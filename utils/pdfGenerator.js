import PDFDocument from 'pdfkit';


function generatePDF(order, type = 'shopkeeper') {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(16).text(`Order (${type.toUpperCase()})`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Supplier: ${order.supplierId.name}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.moveDown();
    doc.text("------------------------------------------------");

    if (type === 'shopkeeper') {
      doc.text("Product | Weight | Type | Rate | Qty | MRP | Amount");

      order.products.forEach(p => {
        const pr = p.productId;
        const amount = pr.rate * p.quantity;
        doc.text(`${pr.name} | ${pr.weight} | ${pr.type} | ₹${pr.rate} | ${p.quantity} | ₹${pr.mrp} | ₹${amount}`);
      });

      doc.moveDown();
      doc.text("------------------------------------------------");
      doc.text(`Total Weight: ${order.totalWeight} kg`);
      doc.text(`Total Amount: ₹${order.totalAmount}`);
    } else {
      doc.text("Product | Type | Qty");

      order.products.forEach(p => {
        const pr = p.productId;
        doc.text(`${pr.name} | ${pr.type} | ${p.quantity}`);
      });
    }

    doc.end();
  });
}

export default generatePDF;