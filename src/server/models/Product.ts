import mongoose, { type InferSchemaType, type Model } from "mongoose";

const { Schema, model, models } = mongoose;

const VariantSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    delta: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const ProductSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: "", trim: true },
    category: { type: String, required: true, index: true },
    occasions: { type: [String], default: [] },

    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0 },

    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 },

    /** Generated-SVG fallback when no image has been uploaded. */
    art: {
      kind: {
        type: String,
        enum: ["cake", "bouquet", "basket", "combo", "plant", "hamper"],
        default: "cake",
      },
      hues: { type: [String], default: ["#C9A227", "#F0E1B4"] },
    },
    /** An uploaded image wins over the generated art. */
    image: { type: Schema.Types.ObjectId, ref: "Media", default: null },

    variants: { type: [VariantSchema], default: [{ label: "Standard", delta: 0 }] },
    flavours: { type: [String], default: [] },
    contains: { type: [String], default: [] },

    description: { type: String, default: "" },
    care: { type: String, default: "" },

    bestseller: { type: Boolean, default: false },
    eggless: { type: Boolean, default: false },
    sameDay: { type: Boolean, default: false },

    active: { type: Boolean, default: true, index: true },
    sort: { type: Number, default: 0 },
  },
  { timestamps: true },
);

ProductSchema.index({ name: "text", tagline: "text" });

export type ProductDoc = InferSchemaType<typeof ProductSchema> & { _id: string };

export const Product: Model<ProductDoc> =
  (models.Product as Model<ProductDoc>) ?? model<ProductDoc>("Product", ProductSchema);
