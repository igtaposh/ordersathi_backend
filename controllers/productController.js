import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';


// Add Product
export const addProduct = async (req, res) => {
   try {
      const { name, weight, rate, mrp, type } = req.body;
      const { supplierId } = req.params;

      if (!name || !supplierId || !weight || !rate || !mrp || !type) {
         return res.status(400).json({ msg: "Please fill all fields" });
      }
      if (isNaN(rate) || isNaN(mrp)) {
         return res.status(400).json({ msg: "Rate and MRP must be numbers" });
      }
      const selectedSupplier = await Supplier.findById(supplierId);
      if (!selectedSupplier) {
         return res.status(404).json({ msg: "Supplier not found" });
      }
      const existingProduct = await Product.findOne({ name, userId: req.userId, supplierId });
      if (existingProduct) {
         return res.status(400).json({ msg: "Product already exists" });
      }

      const product = await Product.create({
         userId: req.userId,
         supplierId,
         name, weight, rate, mrp, type
      });

      res.status(201).json({ msg: "Product added", product });
   } catch (err) {
      res.status(500).json({ msg: "Error adding product", error: err.message });
   }
};

export const addBulkProducts = async (req, res) => {
   try {
      const data = req.body; // JSON array
      const result = await Product.insertMany(data);
      res.status(200).json({ message: "Products inserted", result });

   } catch (err) {
      res.status(500).json({ msg: "Error adding bulk products", error: err.message });
   }
};

// Get All Products
export const getProducts = async (req, res) => {
   try {
      const products = await Product.find({ userId: req.userId })
         .populate('supplierId', 'name')
         .sort({ createdAt: -1 });

      res.json(products);
   } catch (err) {
      res.status(500).json({ msg: "Error fetching products", error: err.message });
   }
};

// Get Single Product
export const getProduct = async (req, res) => {
   try {
    const product = await Product.findById(req.params.id).populate('supplierId', 'name');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Send the product data
    res.status(200).json(product);

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product details',
      error: error.message
    });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
   try {
      const updated = await Product.findOneAndUpdate(
         { _id: req.params.id, userId: req.userId },
         req.body,
         { new: true }
      );
      if (!updated) return res.status(404).json({ msg: "Product not found" });

      res.json({ msg: "Product updated", product: updated });
   } catch (err) {
      res.status(500).json({ msg: "Error updating product", error: err.message });
   }
};

// Delete Product
export const deleteProduct = async (req, res) => {
   try {
      const deleted = await Product.findOneAndDelete({ _id: req.params.id, userId: req.userId });

      if (!deleted) return res.status(404).json({ msg: "Product not found" });

      res.json({ msg: "Product deleted" });
   } catch (err) {
      res.status(500).json({ msg: "Error deleting product", error: err.message });
   }
};

export const getProductBySupplier = async (req, res) => {
   try {
      const products = await Product.find({ supplierId: req.params.supplierId });
      res.json(products);
   } catch (err) {
      res.status(500).json({ msg: "Error fetching products", error: err.message });
   }
};