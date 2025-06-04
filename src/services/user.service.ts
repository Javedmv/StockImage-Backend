import e from 'express';
import { User } from '../models/user.model';
import bcrypt from "bcrypt";


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
        { email: input.email },
        {
          $set: {
            username: input.name,
            phone: input.phone,
            otp: input.otp,
            password: input.password,
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
      throw error;
    }
}

type UserLoginResponse = {
  email: string;
  username: string;
  phone: string;
  isVerified: boolean;
}

export const userLogin = async (email: string, password: string): Promise<UserLoginResponse | null> => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return null;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return null;
    }

    return {
      email: user.email,
      username: user.username,
      phone: user.phone,
      isVerified: user.isVerified,
      };
    } catch (error) {
    console.error("Error in userLogin:", error);
    throw error;
  }
};

export const updatePasswordService = async (email: string, oldPassword:string, newPassword: string): Promise<boolean> => {
  try {
    const user = await User.findOne({ email });
    if(!user){
      console.log("User not found");
      return false;
    }
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordCorrect) {
      console.log("Old password is incorrect");
      return false;
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();
    return true;
  } catch (error) {
    console.log("Error updating password:", error);
    throw error;
  }
}
