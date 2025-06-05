import mongoose, { Schema , Document } from "mongoose";

export interface IImage extends Document {
    title: string;
    imageUrl: string;
    userRef: string;
    order: number;
    createdAt: Date;
  }

const imageSchema: Schema<IImage> = new Schema({
    title: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    userRef: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    }
  }, {
    timestamps: true,
});

export const Image = mongoose.model<IImage>("Image", imageSchema);