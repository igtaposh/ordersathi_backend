import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  weight: String,      // e.g., "5kg", "1L"
  rate: Number,        // rate per unit
  mrp: Number,         // MRP per unit
  type: String         // e.g., "piece", "bag", "case"
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;