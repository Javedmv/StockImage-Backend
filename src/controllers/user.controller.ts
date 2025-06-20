/// <reference path="../custom.d.ts" />
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { createOrUpdateUser, otpVerify, updatePasswordService, userCheck, userLogin } from "../services/user.service";
import { decodeToken, generateOtp } from '../lib/helper';
import { sendOtpMail } from "../lib/nodemailer";
import jwt from "jsonwebtoken"
import dotenv from 'dotenv';
import { imageSave } from "../services/image.service";
dotenv.config();

export interface JwtPayload {
  user: {
    email: string;
    username: string;
    phone: string;
    isVerified: boolean;
  };
  iat: number;
  exp: number;
}

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  // The user is attached by the 'protect' middleware
  res.status(200).json({ message: "User is authenticated", user: req.user });
};

export const signup = async (req: Request, res: Response) => {
  try {
    let { name, email, phone, password } = req.body;
    if (!name || name.trim().length === 0) {
      res.status(400).json({ message: "Name is required" });
      return;
    }
    if( !email || email.trim().length === 0) {
      res.status(400).json({ message: "Email is required" });
      return;
    }
    if( !phone || phone.trim().length === 0) {
      res.status(400).json({ message: "Phone is required" });
      return;
    }
    if( !password || password.trim().length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters long" });
      return;
    }

    // check if user already exsists
    
    name = name.trim().toLowerCase();
    email = email.trim().toLowerCase();
    phone = phone.trim().toLowerCase();
    
    const existingUser = await userCheck(email);
    if(existingUser && existingUser.isVerified == true) {
      res.status(400).json({ message: "User already exists with this email please try to login." });
      return;  
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    password = hashedPassword;
    
    const otp = generateOtp(4);
    const newUser = await createOrUpdateUser({name, email, phone, password, otp});


    if (!newUser) {
      res.status(500).json({ message: "Error creating user" });
      return;
    }
    
    console.log("Generated OTP:", otp);

    await sendOtpMail(email, otp);

    res.status(200).json({message: "Otp generated Successfully"});
    return;
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Server error" });
    return;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await userLogin(email, password);

    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }
    if( !user.isVerified) {
      res.status(400).json({ message: "Please verify your email by signing up" });
      return;
    }

    const token = jwt.sign({ user }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    res.status(200).json({ message: "User logged in successfully", user });
    return;
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Server error" });
    return;
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { otp ,email } = req.body;
    if (!otp || otp.trim().length < 4) {
      res.status(400).json({ message: "OTP is required" });
      return;
    }
    if( !email || email.trim().length === 0) {
      res.status(400).json({ message: "Email is required" });
      return;
    }
    // Simulate OTP verification logic
    const response = await otpVerify(email, otp)
    if(!response) {
      res.status(400).json({ isVerified:false ,message: "Invalid OTP" });
      return;
    }
    res.status(200).json({ isVerified: true, message: "OTP verified successfully" });
    return;
  } catch (error) {
    console.error("Error in OTP verification:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Server error" });
    return;
  }
}

export const logout = (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });
    res.status(200).json({ message: "User logged out successfully" });
    return;
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Server error during logout" });
    return;
  }
}

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (
      !oldPassword?.trim() ||
      !newPassword?.trim() ||
      newPassword.length < 6
    ) {
      res.status(400).json({ message: "Password is required and must be at least 6 characters long" });
      return;
    }
    if(!req.user){
      return;
    }

    const user = req.user!;

    const isSuccessfull = await updatePasswordService(user.email, oldPassword, newPassword);

    if (!isSuccessfull) {
      res.status(400).json({ message: "Old password is incorrect or user not found" });
      return;
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in updatePassword:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Server error" });
  }
};