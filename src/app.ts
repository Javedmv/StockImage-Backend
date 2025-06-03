import express from "express";
import userRoutes from "./routes/user.routes";
import cors from "cors";
import cookieParser from 'cookie-parser';
import path from "path";
import morgan from "morgan";

import dotenv from "dotenv";
dotenv.config();


const app = express();
// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL, 
  credentials: true
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "src", "uploads")));
app.use(morgan("dev"));


// Routes
app.use("/api/users", userRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
