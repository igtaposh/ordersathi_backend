
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
// Enable CORS for frontend requests
// Make sure to set the correct origin for your frontend application
const corsOptions = {
   origin: process.env.FRONTEND_URL, // Change this to your frontend URL
   methods: ['GET', 'POST', 'PUT', 'DELETE'],
   credentials: true, // Allow cookies to be sent with requests
};
app.use(cors(corsOptions));   



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
