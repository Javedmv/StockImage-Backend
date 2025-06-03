import { Image } from "../models/image.model";

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
    throw new Error("Failed to save images");
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
      imageUrl: `${process.env.BACKEND_URL || "http://localhost:5000"}${img.imageUrl}`,
    }));
    console.log(imageList, "imageList");

    return imageList;
  } catch (error) {
    console.log(error)
  }
}
