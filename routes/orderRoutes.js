import express from 'express';
import { createOrder, generatePDF_doc, getMonthlySummary, getOrder, getRecentOrders, getTopProducts, getTopSuppliers } from '../controllers/orderController.js';
import { authMid } from '../middleware/authMiddleware.js';
const router = express.Router();


router.route('/new').post(authMid, createOrder);
router.route('/:id').get(authMid, getOrder);
router.route('/:id/pdf').get(authMid, generatePDF_doc);

router.route('/stats/monthly').get(authMid, getMonthlySummary)
router.route('/stats/top-products').get(authMid, getTopProducts);
router.route('/stats/top-suppliers').get(authMid, getTopSuppliers);
router.route('/stats/recent-orders').get(authMid, getRecentOrders);


export default router;