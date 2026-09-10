// Relative, not the @/ alias: these models are also loaded by
// scripts/seed.ts under plain Node, which cannot resolve @/.
import mongoose, { type Model } from "mongoose";

const { Schema, model, models } = mongoose;

/**
 * A blog post. Kept deliberately close to the product shape — slug, cover
 * image, generated-art fallback — so the same media library and the same card
 * layout work for both.
 */
const PostSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, default: "", trim: true },
    body: { type: String, default: "" },

    author: { type: String, default: "" },
    tags: { type: [String], default: [] },

    cover: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    art: {
      kind: {
        type: String,
        enum: ["cake", "bouquet", "basket", "combo", "plant", "hamper"],
        default: "bouquet",
      },
      hues: { type: [String], default: ["#A6122B", "#E8607A"] },
    },

    published: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date, default: null },
    readMinutes: { type: Number, default: 0 },
  },
  { timestamps: true },
);

PostSchema.index({ publishedAt: -1 });

export type PostDoc = {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  tags: string[];
  cover: string | null;
  art: { kind: string; hues: string[] };
  published: boolean;
  publishedAt: Date | null;
  readMinutes: number;
  createdAt: Date;
  updatedAt: Date;
};

export const Post: Model<PostDoc> =
  (models.Post as Model<PostDoc>) ?? model<PostDoc>("Post", PostSchema);
