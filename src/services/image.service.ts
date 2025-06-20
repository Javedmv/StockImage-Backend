import path from "path";
import { Image } from "../models/image.model";
import fs from 'fs';
import cloudinary from "../config/cloudinary";

type UploadedFiles = {
  filename: string;
  path: string;
};
export type ImageDocument = {
  title: string;
  imageUrl: string;
  userRef: string;
  order: number;
};

export const imageSave = async (
  uploadedFiles: Express.Multer.File[],
  email: string,
  titles: string[]
): Promise<string> => {
  try {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      throw new Error("No files to save");
    }
    if (!email) {
      throw new Error("Email is required");
    }

    const order = await Image.countDocuments({ userRef: email }) || 0;
    const images: ImageDocument[] = [];

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const title = titles[i] || "Untitled";

      const base64String = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      const uploadResult = await cloudinary.uploader.upload(base64String, {
        folder: "stockImage", 
      });

      images.push({
        title,
        imageUrl: uploadResult.secure_url,
        userRef: email,
        order: order + i + 1,
      });
    }

    await Image.insertMany(images);
    return "Images uploaded to Cloudinary and saved to DB successfully";
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unknown error occurred while uploading to Cloudinary"
    );
  }
};



export const getAllImages = async (email:string) => {
  try {
    const allImages = await Image.find({userRef: String(email)}).sort({ order: 1 });
    const imageList = allImages.map((img) => ({
      _id: img._id,
      title: img.title,
      order: img.order,
      createdAt: img.createdAt,
      imageUrl: img.imageUrl,
    }));
    return imageList;
  } catch (error) {
    console.error("Error fetching images:", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred while fetching images");
  }
}

export const updateSingleImage = async (
  imageId: string,
  uploadedFile: Express.Multer.File,
  title: string,
  userEmail: string
): Promise<any> => {
  try {
    if (!uploadedFile) {
      throw new Error("No file provided");
    }
    if (!imageId) {
      throw new Error("Image ID is required");
    }

    const existingImage = await Image.findOne({ _id: imageId, userRef: userEmail });
    if (!existingImage) {
      throw new Error("Image not found or unauthorized");
    }

    const oldUrl = existingImage.imageUrl;
    let publicIdToDelete;

    try {
      const urlParts = oldUrl.split("/");
      const lastPart = urlParts[urlParts.length - 1];
      const folderIndex = urlParts.findIndex(part => part === "upload") + 1;
      const folderAndFile = urlParts.slice(folderIndex).join("/"); 

      publicIdToDelete = folderAndFile.replace(/\.[^/.]+$/, ""); 
    } catch (e) {
      console.warn("Could not extract public_id from Cloudinary URL:", e);
    }

    const base64String = `data:${uploadedFile.mimetype};base64,${uploadedFile.buffer.toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(base64String, {
      folder: "stockImage",
    });

    if (publicIdToDelete) {
      try {
        await cloudinary.uploader.destroy(publicIdToDelete);
      } catch (e) {
        console.warn("Failed to delete old image from Cloudinary:", e);
      }
    }

    const updateData: any = {
      title: title || existingImage.title,
      imageUrl: uploadResult.secure_url,
    };

    const updatedImage = await Image.findByIdAndUpdate(imageId, updateData, { new: true });

    return updatedImage;
  } catch (error) {
    console.error("Error updating image:", error);
    throw error;
  }
};
