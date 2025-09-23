// const Supplier = require('../models/Supplier');
import Supplier from '../models/Supplier.js';

// Add supplier
export const addSupplier = async (req, res) => {
  try {
    const { name, contact, address } = req.body;
    if (!name) {
      return res.status(400).json({ msg: "Please enter a valid name" });
    }
    const existingSupplier = await Supplier.findOne({ name, userId: req.userId });
    if (existingSupplier) {
      return res.status(400).json({ msg: "Supplier already exists" });
    }
    const supplier = await Supplier.create({
      userId: req.userId,
      name, contact, address
    });
    res.status(201).json({ msg: "Supplier added", supplier });
  } catch (err) {
    res.status(500).json({ msg: "Error adding supplier", error: err.message });
  }
};

// Get all suppliers (of current user)
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching suppliers", error: err.message });
  }
};

// Get single supplier
export const getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ _id: req.params.id, userId: req.userId });
    if (!supplier) return res.status(404).json({ msg: "Supplier not found" });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching supplier", error: err.message });
  }
};

// Update supplier
export const updateSupplier = async (req, res) => {
  try {
    const updated = await Supplier.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: "Supplier not found" });
    res.json({ msg: "Supplier updated", supplier: updated });
  } catch (err) {
    res.status(500).json({ msg: "Error updating supplier", error: err.message });
  }
};

// Delete supplier
export const deleteSupplier = async (req, res) => {
  try {
    const deleted = await Supplier.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deleted) return res.status(404).json({ msg: "Supplier not found" });
    const deleteProducts = await Product.deleteMany({ supplierId: req.params.id, userId: req.userId });
    res.json({ msg: "Supplier deleted and its products removed", products: deleteProducts });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting supplier", error: err.message });
  }
};