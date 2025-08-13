import express from 'express';
import { authMid } from '../middleware/authMiddleware.js';
import { addBulkProducts, addProduct, deleteProduct, getProduct, getProducts, updateProduct } from '../controllers/productController.js';
const router = express.Router();


router.route('/add/:supplierId').post(authMid, addProduct);
router.route('/bulk').post(authMid, addBulkProducts);
router.route('/').get(authMid, getProducts);
router.route('/:id').get(authMid, getProduct).put(authMid, updateProduct).delete(authMid, deleteProduct);

export default router;