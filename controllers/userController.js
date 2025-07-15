import User from '../models/User.js';
import jwt from 'jsonwebtoken';


export const register = async (req, res) => {
   try {
      const { name, shopName, phone, email } = req.body;
      if (!name || !shopName || !phone) {
         return res.status(400).json({ message: 'Please fill all the fields' });
      }
      const existingUser = await User.findOne({ phone });
      if (existingUser) {
         return res.status(400).json({ message: 'User already exists' });
      }
      const user = await User.create({ name, shopName, phone, email });
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

export const getUserProfile = async (req, res) => {
   try {
      const {userId} = req;
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