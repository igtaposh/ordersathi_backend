import express from 'express';
import { createStockReport, deleteStockReport, downloadStockReport, getRecentReports, getStockReport } from '../controllers/StockReportController.js';
import { authMid } from '../middleware/authMiddleware.js';
const router = express.Router();


router.get('/:id/pdf', authMid, downloadStockReport);
router.get('/:id', authMid, getStockReport);
router.delete('/delete/:id', authMid, deleteStockReport);
router.post('/new', authMid, createStockReport);
router.get('/', authMid, getRecentReports);

export default router;