import express from 'express';
import {
   getUserProfile,
   login,
   logout,
   register,
   verifyOtp,
   sendOtp,
   updateUserProfile,
   deleteUserAccount
} from '../controllers/userController.js';
import { authMid } from '../middleware/authMiddleware.js';
import otpLimiter from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Protected routes (require authentication)
router.post('/logout', authMid, logout);
router.get('/user-profile', authMid, getUserProfile);
router.put('/update-profile', authMid, updateUserProfile);
router.delete('/delete-account', authMid, deleteUserAccount);

export default router;