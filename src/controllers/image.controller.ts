import { Request, Response } from "express";
import { getAllImages, imageSave, updateSingleImage } from "../services/image.service";
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
      console.error("Error handling file upload:", error);
      res.status(500).json({ message: error || "Internal Server Error" });
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
      console.error("Error fetching images:", error);
      res.status(500).json({ message: error || "Internal Server Error" });
      return;
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
      console.error("Error updating title:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal Server Error" });
      return;
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
      console.error("Error deleting image:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal Server Error" });
      return;
    }
  };

export const reorderImages = async (req: Request, res: Response) => {
  try {
    const { updates } = req.body;
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
    console.error("Error reordering images:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Internal Server Error" });
    return;
  }
};

export const editImages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || title.trim() === "") {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    // Get user from token
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
    const imageFile = req.file;

    if(!imageFile){
      res.status(400).json({ message: "Image file is required" });
      return;
    }

    const updatedImage = await updateSingleImage(id, imageFile, title, user.email);

    res.status(200).json({ 
      message: imageFile ? "Image and title updated successfully" : "Title updated successfully", 
      image: updatedImage 
    });
    return;
  } catch (error: any) {
    console.error("Edit error:", error);
    if (error.message === "Image not found or unauthorized") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal Server Error" });
    }
    return;
  }
}