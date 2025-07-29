#!/usr/bin/env node

// Production test script for the enhanced PDF generator
import { generatePDF, generateStockPDF } from './utils/pdfGenerator.js';

console.log('🧪 Testing Enhanced PDF Generator in Production Mode...\n');

// Set production environment
process.env.NODE_ENV = 'production';

// Mock order data for testing
const mockOrder = {
   _id: 'test123',
   createdAt: new Date(),
   supplierId: { name: 'Test Supplier Ltd.' },
   totalAmount: 1500,
   totalWeight: 10.5,
   products: [
      {
         productId: {
            name: 'Test Product 1',
            mrp: 100,
            rate: 90,
            type: 'Premium',
            weight: '500g'
         },
         quantity: 10
      },
      {
         productId: {
            name: 'Test Product 2',
            mrp: 150,
            rate: 135,
            type: 'Standard',
            weight: '1kg'
         },
         quantity: 5
      }
   ]
};

// Mock stock report data
const mockStockReport = {
   _id: 'stock123',
   createdAt: new Date(),
   supplierId: { name: 'Test Supplier Ltd.' },
   products: [
      {
         productId: {
            name: 'Stock Item 1',
            mrp: 100,
            weight: '500g',
            type: 'Premium'
         },
         quantity: 25
      },
      {
         productId: {
            name: 'Stock Item 2',
            mrp: 150,
            weight: '1kg',
            type: 'Standard'
         },
         quantity: 40
      }
   ]
};

async function testPDFGeneration() {
   try {
      console.log('1. Testing Order PDF generation...');
      const orderPDF = await generatePDF(mockOrder, 'shopkeeper');
      console.log(`✅ Order PDF generated successfully! Size: ${orderPDF.length} bytes`);

      console.log('2. Testing Stock Report PDF generation...');
      const stockPDF = await generateStockPDF(mockStockReport);
      console.log(`✅ Stock PDF generated successfully! Size: ${stockPDF.length} bytes`);

      console.log('\n🎉 All PDF generation tests passed!');
      console.log('Your enhanced PDF generator is ready for production.');

   } catch (error) {
      console.error('❌ PDF generation test failed:');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      process.exit(1);
   }
}

testPDFGeneration();
