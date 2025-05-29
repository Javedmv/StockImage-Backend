import e from 'express';
import { User } from '../models/user.model';

interface CreateUserInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  otp: string;
}
export const userCheck = async (email: string) => {
    try {
        const user = await User.findOne({ email: email});
        if (user) {
            return user;
        } else {
            return null;
        }
    } catch (error) {
        console.log("Error checking user:", error);
    }
}

export const createOrUpdateUser = async (input: CreateUserInput) => {
    try {
      const updatedUser = await User.findOneAndUpdate(
        { email: input.email }, // Filter by email
        {
          $set: {
            username: input.name,
            phone: input.phone,
            otp: input.otp,
            password: input.password, // Make sure it's already hashed if required
          },
        },
        {
          new: true,        // Return the updated document
          upsert: true,     // Create if not exists
          setDefaultsOnInsert: true,
        }
      );
  
      return updatedUser;
    } catch (error) {
      console.error("Error creating or updating user:", error);
      throw error;
    }
  };

export const otpVerify = async (email: string, otp: string) => {
    try {
        const user = await User.findOne({ email: email, otp: otp });
        if (user) {
            user.isVerified = true;
            user.otp = "";
            await user.save();
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log("Error verifying OTP:", error);
    }
}
