import { Request, Response } from "express";

export const getUsers = (req: Request, res: Response) => {
  res.json([{ id: 1, name: "Javed" }]);
};

export const signup = (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;
  if (!name) {
    res.status(400).json({ message: "Name is required" });
    return;
  }
  res.status(201).json({ id: Date.now(), name });
};

export const login = (req: Request, res: Response) => {
  const { data, password } = req.body;
  res.status(200).json({message: "user logedin"});
}

export const verifyOtp = (req: Request, res: Response) => {
  const { otp } = req.body;
  console.log(otp, "from verifyOtp");
  if (!otp || otp.trim().length < 4) {
    res.status(400).json({ message: "OTP is required" });
    return;
  }
  // Simulate OTP verification logic
  if (otp === "123456") {
    res.status(200).json({ message: "OTP verified successfully" });
  } else {
    res.status(400).json({ message: "Invalid OTP" });
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