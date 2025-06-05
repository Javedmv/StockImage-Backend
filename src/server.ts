import app from "./app";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT || 5000);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port:${PORT}`);
  connectDB();
});