import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

/**
 * Images live in the document as a Buffer. Product photography sits well under
 * Mongo's 16 MB limit, and it keeps the whole app to one dependency — no S3,
 * no Cloudinary, and nothing to configure before an upload works.
 */
const MediaSchema = new Schema(
  {
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    alt: { type: String, default: "" },
    data: { type: Buffer, required: true },
    uploadedBy: { type: String, default: "" },
  },
  { timestamps: true },
);

MediaSchema.index({ createdAt: -1 });

export type MediaDoc = {
  _id: string;
  filename: string;
  contentType: string;
  size: number;
  alt: string;
  data: Buffer;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export const Media: Model<MediaDoc> =
  (models.Media as Model<MediaDoc>) ?? model<MediaDoc>("Media", MediaSchema);
