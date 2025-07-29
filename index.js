
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import ccokiesParser from 'cookie-parser';
import supplierRoutes from './routes/SupplierRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import stockReportRoutes from './routes/stockReportRoutes.js';

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(ccokiesParser());
app.use(cors({
   origin: 'http://localhost:5173', // or your frontend URL
   credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/product', productRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/stock-report', stockReportRoutes);

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI)
   .then(() => {
      console.log("✅ MongoDB Connected");
      app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
   })
   .catch(err => console.error(err));
