import { JwtPayload } from "../controllers/user.controller";
import jwt from "jsonwebtoken";

export const generateOtp = (length: number = 4): string => {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10); // Adds a digit from 0–9
    }
    return otp;
};

export const decodeToken = (token: string): JwtPayload & { user?: any } => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT secret not defined");

  return jwt.verify(token, secret) as JwtPayload & { user?: any };
};