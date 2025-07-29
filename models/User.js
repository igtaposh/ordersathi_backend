import mongoose from 'mongoose';
import dotenv from 'dotenv';


const userSchema = new mongoose.Schema({
   name:String,
   shopName:String,
   role: String,
   phone: {
      type:String,
      required:true,
      unique: true
   },
   email: String
},{timestamps: true})

const User = mongoose.model('User', userSchema);
export default User;