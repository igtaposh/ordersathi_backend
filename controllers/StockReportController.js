import Product from "../models/Product.js";
import StockReport from "../models/Stock.js";
import User from "../models/User.js";
import { generateStockPDF } from "../utils/pdfGenerator.js";

export const createStockReport = async (req, res) => {
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

    const stockReport = await StockReport.create({
      userId: req.userId,
      supplierId,
      products: productDetails
    });

    res.status(201).json({ msg: "Stock report created", stockReport });
  } catch (err) {
    res.status(500).json({ msg: "Stock report creation failed", error: err.message });
  }
};

export async function getStockReport(req, res) {
   try {
      const stockReport = await StockReport.findOne({ _id: req.params.id, userId: req.userId })
         .populate('supplierId')
         .populate('products.productId');

      if (!stockReport) return res.status(404).json({ msg: "Stock report not found" });

      res.json(stockReport);
   } catch (err) {
      res.status(500).json({ msg: "Error getting stock report", error: err.message });
   }
}

export async function deleteStockReport(req, res) {
   try {
      const stockReport = await StockReport.findOne({ _id: req.params.id, userId: req.userId })
         .populate('supplierId')
         .populate('products.productId');

      if (!stockReport) return res.status(404).json({ msg: "Stock report not found" });

      await stockReport.deleteOne({ _id: req.params.id, userId: req.userId });
      res.json({ msg: "Stock report deleted successfully" });
   } catch (err) {
      res.status(500).json({ msg: "Error deleting stock report", error: err.message });
   }
}

export const downloadStockReport = async (req, res) => {
  try {
    const stockReport = await StockReport.findOne({ _id: req.params.id, userId: req.userId })
      .populate('supplierId')
      .populate('products.productId');
    
    if (!stockReport) return res.status(404).json({ msg: "Stock report not found" });
    const shopName = await User.findById(req.userId).select('shopName');
    const pdfBuffer = await generateStockPDF(stockReport, shopName);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=stock-report.pdf`
    });

    res.send(pdfBuffer);
    
  } catch (err) {
    res.status(500).json({ msg: "PDF generation failed", error: err.message });
    console.log(err);
  }
};

export const getRecentReports = async (req, res) => {
  try {
    const stockReport = await StockReport.find({ userId: req.userId })
      .populate('supplierId', 'name')
      .sort({ createdAt: -1 });

    const result = stockReport.map(o => ({
      id: o._id,
      supplier: o.supplierId?.name || 'Unknown',
      createdAt: o.createdAt
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ msg: "Error getting recent Stock Report", error: err.message });
  }
};
