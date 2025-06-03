import { Request, Response } from "express";
import { getAllImages, imageSave } from "../services/image.service";
import { decode } from '../../node_modules/@types/jsonwebtoken/index.d';
import { decodeToken } from "../lib/helper";
import { Image } from "../models/image.model";

export const handleUpload = async (req: Request, res: Response):Promise<void> => {
    try { 
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ message: 'No files uploaded' });
        return;
      }
      const { titles } = req.body;

      const uploadedFiles = files.map((file) => ({
        filename: file.filename,
        path: file.path,
      }));

      const token = req.cookies?.token;

      if (!token) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
      }
  
      const decoded = decodeToken(token);

      if (!decoded || !decoded.user) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
        return;
      }

      const user = decoded.user;
      const result = await imageSave(uploadedFiles, user.email, titles)
  
      // Here you can save the uploaded file information to your database if needed
  
      res.status(200).json({ message: 'Files uploaded successfully', files: uploadedFiles });
      return;
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Server error during upload' });
      return;
    }
  };


  export const getImage = async (req: Request, res: Response) => {
    try {
      const token = req.cookies?.token;

      if (!token) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
      }
  
      const decoded = decodeToken(token);

      if (!decoded.user) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
        return;
      }

      const user = decoded.user;

      const images = await getAllImages(user.email);

      res.status(200).json({
        message: "Images fetched successfully",
        images,
      });
      return;
    } catch (error) {
      console.log(error);
    }
  }

  export const editTitle = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title } = req.body;

      if (!title || title.trim() === "") {
        res.status(400).json({ message: "Title is required" });
        return;
      }
      const response = await Image.findByIdAndUpdate(id, { title }, { new: true });
      if (!response) {
        res.status(404).json({ message: "Image not found" });
        return;
      }
      res.status(200).json({ message: "Title updated successfully", image: response });
      return;
    } catch (error) {
      console.log(error); 
    }
  }

  export const deleteImage = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ message: "Image ID is required" });
        return;
      }
  
      const imageToDelete = await Image.findById(id);
      if (!imageToDelete) {
        res.status(404).json({ message: "Image not found" });
        return;
      }
  
      const deletedOrder = imageToDelete.order;
  
      await Image.findByIdAndDelete(id);
  
      await Image.updateMany(
        { order: { $gt: deletedOrder } },
        { $inc: { order: -1 } }
      );
  
      res.status(200).json({ message: "Image deleted and order updated" })
      return;
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
  };

export const reorderImages = async (req: Request, res: Response) => {
  try {
    const { updates } = req.body;
    console.log(updates, "updates");
    if (!Array.isArray(updates)) {
      res.status(400).json({ message: 'Invalid updates payload' });
      return;
    }

    const ops = updates.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order } },
      },
    }));

    await Image.bulkWrite(ops);

    res.status(200).json({ message: 'Image order updated successfully' });
    return;
  } catch (error) {
    console.error('Order update failed:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};
