
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import generatePDF from '../utils/pdfGenerator.js';

export const createOrder = async (req, res) => {
   try {
      const { supplierId, products } = req.body;

      const productDetails = await Promise.all(products.map(async (item) => {
         const product = await Product.findOne({ _id: item.productId, userId: req.userId });
         if (!product) throw new Error("Invalid product");
         return {
            ...item,
            product
         };
      }));

      let totalAmount = 0;
      let totalWeight = 0;

      for (let item of productDetails) {
         totalAmount += item.product.rate * item.quantity;
         const weight = parseFloat(item.product.weight) || 0;
         totalWeight += weight * item.quantity;
      }

      const order = await Order.create({
         userId: req.userId,
         supplierId,
         products,
         totalAmount,
         totalWeight
      });

      res.status(201).json({ msg: "Order created", order });
   } catch (err) {
      res.status(500).json({ msg: "Order creation failed", error: err.message });
   }
};

export const getOrder = async (req, res) => {
   try {
      const order = await Order.findOne({ _id: req.params.id, userId: req.userId })
         .populate('supplierId')
         .populate('products.productId');

      if (!order) return res.status(404).json({ msg: "Order not found" });

      res.json(order);
   } catch (err) {
      res.status(500).json({ msg: "Error getting order", error: err.message });
   }
};

export const generatePDF_doc = async (req, res) => {
   try {
      const order = await Order.findOne({ _id: req.params.id, userId: req.userId })
         .populate('supplierId')
         .populate('products.productId');

      if (!order) return res.status(404).json({ msg: "Order not found" });

      const type = req.query.type || 'shopkeeper';

      const pdfBuffer = await generatePDF(order, type);

      res.set({
         'Content-Type': 'application/pdf',
         'Content-Disposition': `attachment; filename=order-${type}.pdf`
      });

      res.send(pdfBuffer);
   } catch (err) {
      res.status(500).json({ msg: "PDF generation failed", error: err.message });
   }
};

export const getMonthlySummary = async (req, res) => {
   try {
     const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
 
     const orders = await Order.find({
       userId: req.userId,
       createdAt: { $gte: start }
     });
 
     const totalOrders = orders.length;
     const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
     const totalWeight = orders.reduce((sum, o) => sum + o.totalWeight, 0);
 
     res.json({ totalOrders, totalAmount, totalWeight });
   } catch (err) {
     res.status(500).json({ msg: "Failed to get monthly summary", error: err.message });
   }
 };

 export const getTopProducts = async (req, res) => {
   try {
     const orders = await Order.find({ userId: req.userId });
 
     const productMap = new Map();
 
     for (let order of orders) {
       for (let p of order.products) {
         const key = p.productId.toString();
         productMap.set(key, (productMap.get(key) || 0) + p.quantity);
       }
     }
 
     const sorted = [...productMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
     const ids = sorted.map(([id]) => id);
 
     const products = await Product.find({ _id: { $in: ids } });
 
     const result = products.map(p => ({
       name: p.name,
       type: p.type,
       totalQuantity: productMap.get(p._id.toString())
     }));
 
     res.json(result);
   } catch (err) {
     res.status(500).json({ msg: "Error getting top products", error: err.message });
   }
 };

 export const getTopSuppliers = async (req, res) => {
   try {
     const orders = await Order.find({ userId: req.userId });
 
     const supplierMap = new Map();
 
     for (let o of orders) {
       const key = o.supplierId.toString();
       supplierMap.set(key, (supplierMap.get(key) || 0) + o.totalAmount);
     }
 
     const sorted = [...supplierMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
     const ids = sorted.map(([id]) => id);
 
     const suppliers = await Supplier.find({ _id: { $in: ids } });
 
     const result = suppliers.map(s => ({
       name: s.name,
       contact: s.contact,
       totalPurchase: supplierMap.get(s._id.toString())
     }));
 
     res.json(result);
   } catch (err) {
     res.status(500).json({ msg: "Error getting top suppliers", error: err.message });
   }
 };

 export const getRecentOrders = async (req, res) => {
   try {
     const orders = await Order.find({ userId: req.userId })
       .populate('supplierId', 'name')
       .sort({ createdAt: -1 })
       .limit(5);
 
     const result = orders.map(o => ({
       id: o._id,
       supplier: o.supplierId?.name || 'Unknown',
       totalAmount: o.totalAmount,
       createdAt: o.createdAt
     }));
 
     res.json(result);
   } catch (err) {
     res.status(500).json({ msg: "Error getting recent orders", error: err.message });
   }
 };