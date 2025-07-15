
import express from 'express';
import { getUserProfile, login, register } from '../controllers/userController.js';
import { authMid } from '../middleware/authMiddleware.js';
const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/user-profile').get(authMid, getUserProfile);

export default router;