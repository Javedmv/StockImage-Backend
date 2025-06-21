import { Request, Response } from "express";
import { getAllImages, imageSave, updateSingleImage } from "../services/image.service";
import { decodeToken } from "../lib/helper";
import { Image } from "../models/image.model";
import cloudinary from "../config/cloudinary";

export const handleUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ message: 'No files uploaded' });
      return;
    }

    const { titles } = req.body;
    const user = req.user!;

    await imageSave(files, user.email, titles);

    res.status(200).json({ message: 'Files uploaded successfully' });
  } catch (error) {
    console.error("Error handling file upload:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Internal Server Error" });
  }
};


export const getImage = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const images = await getAllImages(user.email);
    res.status(200).json({
      message: "Images fetched successfully",
      images,
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Internal Server Error" });
  }
};

export const editTitle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const user = req.user!;

    if (!title || title.trim() === "") {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    const image = await Image.findOne({ _id: id, userEmail: user.email });

    if (!image) {
      res.status(404).json({ message: "Image not found or you are not authorized to edit it" });
      return;
    }

    image.title = title;
    await image.save();

    res.status(200).json({ message: "Title updated successfully", image });
  } catch (error) {
    console.error("Error updating title:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Internal Server Error" });
  }
};

export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const imageToDelete = await Image.findOne({ _id: id, userEmail: user.email });
    if (!imageToDelete) {
      res.status(404).json({ message: "Image not found or you are not authorized to delete it" });
      return;
    }

    if (imageToDelete.publicId) {
      try {
        await cloudinary.uploader.destroy(imageToDelete.publicId);
      } catch (e) {
        console.warn("Failed to delete image from Cloudinary:", e);
      }
    }

    const deletedOrder = imageToDelete.order;
    await Image.findByIdAndDelete(id);

    await Image.updateMany(
      { userEmail: user.email, order: { $gt: deletedOrder } },
      { $inc: { order: -1 } }
    );

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Internal Server Error" });
  }
};

export const reorderImages = async (req: Request, res: Response) => {
  try {
    const { updates } = req.body;
    const user = req.user!;

    if (!Array.isArray(updates)) {
      res.status(400).json({ message: 'Invalid updates payload' });
      return;
    }

    const imageIds = updates.map((u) => u.id);
    const images = await Image.find({ _id: { $in: imageIds }, userEmail: user.email });

    if (images.length !== imageIds.length) {
      res.status(403).json({ message: "You are not authorized to reorder one or more of the selected images." });
      return;
    }

    const ops = updates.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id, userEmail: user.email },
        update: { $set: { order } },
      },
    }));

    await Image.bulkWrite(ops);

    res.status(200).json({ message: 'Image order updated successfully' });
  } catch (error) {
    console.error("Error reordering images:", error);
    res.status(500).json({ message: error instanceof Error ? error.message : "Internal Server Error" });
  }
};

export const editImages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const user = req.user!;
    const imageFile = req.file;

    if (!title || title.trim() === "") {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    if (!imageFile) {
      res.status(400).json({ message: "Image file is required" });
      return;
    }

    const updatedImage = await updateSingleImage(id, imageFile, title, user.email);

    res.status(200).json({ 
      message: "Image and title updated successfully", 
      image: updatedImage 
    });
  } catch (error: any) {
    console.error("Edit error:", error);
    if (error.message === "Image not found or unauthorized") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal Server Error" });
    }
  }
}