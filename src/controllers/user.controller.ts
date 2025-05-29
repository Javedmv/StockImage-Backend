import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { createOrUpdateUser, otpVerify, userCheck } from "../services/user.service";
import { generateOtp } from '../lib/helper';
import { sendOtpMail } from "../lib/nodemailer";

export const getUsers = (req: Request, res: Response) => {
  res.json([{ id: 1, name: "Javed" }]);
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
    console.log("Error in signup:", error);
  }
};

export const login = (req: Request, res: Response) => {
  const { data, password } = req.body;
  res.status(200).json({message: "user logedin"});
}

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { otp ,email } = req.body;
    console.log(otp, email);
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
    console.log(error)
  }
}

export const updatePassword = (req: Request, res: Response) => {
  console.log(req.body)
  const password = req.body.password;
  console.log(password);
  res.status(200).json({ message: "Password updated successfully" });
}

export const uploadImage = (req: Request, res: Response) => {
  const image = req.body.image;
  console.log(image, "from uploadImage");
  if (!image) {
    res.status(400).json({ message: "Image is required" });
    return;
  }
  // Simulate image upload logic
  res.status(200).json({ message: "Image uploaded successfully", imageUrl: "http://example.com/image.jpg" });
}

export const getImage = (req: Request, res: Response) => {
  const imageId = req.params.id;
  console.log(imageId, "from getImage");
  if (!imageId) {
    res.status(400).json({ message: "Image ID is required" });
    return;
  }
  // Simulate fetching image logic
  res.status(200).json({ message: "Image fetched successfully", imageUrl: `http://example.com/image/${imageId}.jpg` });
}