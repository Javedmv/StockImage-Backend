import path from "path";
import { Image } from "../models/image.model";
import fs from 'fs';

type UploadedFiles = {
  filename: string;
  path: string;
};

export const imageSave = async (
  uploadedFiles: UploadedFiles[],
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

    const images = uploadedFiles.map((file, index) => ({
      title: titles[index] || "Untitled",
      imageUrl: `/uploads/${file.filename}`,
      userRef: email,
      order: order + index + 1,
    }));

    await Image.insertMany(images);

    return "Images saved successfully";
  } catch (error) {
    console.error("Error saving images:", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error occurred while saving images");
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
      imageUrl: `${process.env.BACKEND_URL}${img.imageUrl}`,
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

    // Find the existing image to make sure it belongs to the user
    const existingImage = await Image.findOne({ _id: imageId, userRef: userEmail });
    if (!existingImage) {
      throw new Error("Image not found or unauthorized");
    }

    // Prepare update data
    const updateData: any = {
      title: title || existingImage.title,
    };

    // If a new image file is provided, update the imageUrl
    if (uploadedFile) {
      updateData.imageUrl = `/uploads/${uploadedFile.filename}`;
      
      // Optional: Delete the old image file from disk
      const oldImagePath = path.join(process.cwd(), "src", existingImage.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update the image in the database
    const updatedImage = await Image.findByIdAndUpdate(
      imageId,
      updateData,
      { new: true }
    );

    return updatedImage;
  } catch (error) {
    console.error("Error updating image:", error);
    throw error;
  }
};