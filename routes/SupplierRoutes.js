import express from 'express';
import { addSupplier, deleteSupplier, getSupplier, getSuppliers, updateSupplier } from '../controllers/SupplierController.js';
import { authMid } from '../middleware/authMiddleware.js';
const router = express.Router();

router.route('/add').post(authMid, addSupplier);
router.route('/').get(authMid, getSuppliers);
router.route('/:id').get(authMid, getSupplier).put(authMid, updateSupplier).delete(authMid, deleteSupplier);

export default router;
