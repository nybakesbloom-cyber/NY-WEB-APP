import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

/**
 * Editable site copy, one document per block. `data` is deliberately loose —
 * each key has its own shape and the admin edits it through a form built for
 * that key, so a rigid schema here would only get in the way.
 */
const ContentSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    label: { type: String, default: "" },
    data: { type: Schema.Types.Mixed, default: {} },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true },
);

export type ContentDoc = {
  _id: string;
  key: string;
  label: string;
  data: Record<string, unknown>;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export const Content: Model<ContentDoc> =
  (models.Content as Model<ContentDoc>) ?? model<ContentDoc>("Content", ContentSchema);
