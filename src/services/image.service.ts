import { Image } from "../models/image.model";
import cloudinary from "../config/cloudinary";

export const imageSave = async (
  uploadedFiles: Express.Multer.File[],
  email: string,
  titles: string[]
): Promise<string> => {
  try {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      throw new Error("No files to save");
    }

    const order = (await Image.countDocuments({ userEmail: email })) || 0;
    const imagesToSave = uploadedFiles.map((file: any, i) => ({
      title: titles[i] || "Untitled",
      imageUrl: file.path,
      publicId: file.filename,
      userEmail: email,
      order: order + i + 1,
    }));

    await Image.insertMany(imagesToSave);
    return "Images uploaded and saved to DB successfully";
  } catch (error) {
    console.error("Error saving images:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unknown error occurred while saving images"
    );
  }
};



export const getAllImages = async (email: string) => {
  try {
    const allImages = await Image.find({ userEmail: email }).sort({ order: 1 });
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
    const file = uploadedFile as any; // Cast to access cloudinary params

    const existingImage = await Image.findOne({ _id: imageId, userEmail: userEmail });
    if (!existingImage) {
      // If the image doesn't exist, we should delete the newly uploaded file from cloudinary
      await cloudinary.uploader.destroy(file.filename);
      throw new Error("Image not found or unauthorized");
    }

    // Delete the old image from Cloudinary
    if (existingImage.publicId) {
      try {
        await cloudinary.uploader.destroy(existingImage.publicId);
      } catch (e) {
        console.warn("Failed to delete old image from Cloudinary:", e);
      }
    }

    // Update the image document with new data
    existingImage.title = title;
    existingImage.imageUrl = file.path;
    existingImage.publicId = file.filename;

    const updatedImage = await existingImage.save();

    return updatedImage;
  } catch (error) {
    console.error("Error updating image:", error);
    throw error;
  }
};
