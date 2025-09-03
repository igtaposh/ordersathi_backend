import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();


// Initialize Twilio client
const twilioClient = twilio(
   process.env.TWILIO_ACCOUNT_SID,
   process.env.TWILIO_AUTH_TOKEN
);


/**
 * Sends OTP to the user's phone number
 * Uses Twilio in production, logs to console in development
 */


export const sendOtp = async (req, res) => {
   const otp = Math.floor(100000 + Math.random() * 900000).toString();
   const { phone } = req.body;
   if (!phone || phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ msg: "Please enter a valid 10-digit phone number" });
   }
   try {
      // Check if OTP already exists for this phone number
      const existingOtp = await Otp.findOne({ mobile: phone });
      if (existingOtp) {
         return res.status(400).json({ msg: "OTP already sent. Please wait before requesting a new one." });
      }

      // Generate and store OTP
      await Otp.findOneAndDelete({ mobile: phone });
      await Otp.create({ mobile: phone, otp });

      // Development mode: just log OTP
      if (process.env.NODE_ENV === 'development') {
         console.log(`OTP for ${phone}: ${otp}`);
         return res.status(200).json({ msg: "OTP sent successfull, Check your messages" });
      }

      // Production mode: send via Twilio
      try {
         await twilioClient.messages.create({
            body: `${otp} is Your OTP for OrderSathi. Do not share with anyone. This OTP will be valid for next 5 minuts. - OrderSathi`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${phone}`
         });
         res.status(200).json({ msg: "OTP sent successfully" });
      } catch (err) {
         console.error("SMS Error:", err);
         res.status(500).json({ msg: "Failed to send SMS" });
      }
   } catch (error) {
      console.error("OTP Error:", error);
      res.status(500).json({ msg: "Failed to send OTP" });

   }
};

export const verifyOtp = async (req, res) => {
   try {
      const { phone, otp } = req.body;
      // Validate inputs
      if (!phone || !otp) {
         return res.status(400).json({ msg: "Phone and OTP are required" });
      }
      // Find OTP in database
      const otpRecord = await Otp.findOne({ mobile: phone, otp });

      if (!otpRecord) {
         return res.status(400).json({ msg: "Invalid OTP or OTP expired" });
      }

      // Delete used OTP
      await Otp.findByIdAndDelete(otpRecord._id);

      // Find OTP in database

      // Success response
      res.status(200).json({ msg: "OTP verified successfully" });
   } catch (error) {
      console.error("OTP Verification Error:", error);
      res.status(500).json({ msg: "OTP verification failed" });
   }
}

export const register = async (req, res) => {
   try {

      const { name, shopName, phone, email, role } = req.body;
      if (!name || !shopName || !phone || !role) {
         return res.status(400).json({ message: 'Please fill all the fields' });
      }
      const existingUser = await User.findOne({ phone });
      if (existingUser) {
         return res.status(400).json({ message: 'User already exists' });
      }
      const user = await User.create({ name, shopName, phone, email, role });
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ msg: 'User registered successfully', user, token });

   } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });

   }
}

export const login = async (req, res) => {
   try {
      const { phone } = req.body;
      if (!phone) {
         return res.status(400).json({ message: 'Please provide phone number' });
      }
      const user = await User.findOne({ phone });
      if (!user) {
         return res.status(404).json({ message: 'User not found' });
      }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.status(200).cookie('token', token, {
         httpOnly: true,
      }).json({ msg: 'User logged in successfully', user, token });
   } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
   }
}

export const logout = (req, res) => {
   res.clearCookie('token') || res.cookie('token', '', { expires: new Date(0) });
   res.status(200).json({ message: 'User logged out successfully' });
}

export const getUserProfile = async (req, res) => {
   try {
      const { userId } = req;
      console.log(userId);
      const user = await User.findById(req.userId);
      if (!user) {
         return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ user });
   } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
   }
}

export const updateUserProfile = async (req, res) => {
   try {
      const { userId } = req;
      const { name, shopName, phone, email } = req.body;

      if (!name || !shopName || !phone) {
         return res.status(400).json({ message: 'Please fill all the fields' });
      }

      const user = await User.findByIdAndUpdate(userId, { name, shopName, phone, email }, { new: true });
      if (!user) {
         return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'Profile updated successfully', user });
   } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
   }
}

export const deleteUserAccount = async (req, res) => {
   try {
      const { userId } = req;
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
         return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'Account deleted successfully' });
   } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' }); es.status(500).json({ message: 'Server error' });
   }
}
