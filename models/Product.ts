import mongoose, { Schema, Document, Model } from "mongoose";
import "./Category";

export interface IProductSize {
  name: string;
  price: number;
  originalPrice?: number;
}

export interface IProductIncludedItem {
  name: string;
  quantity: number;
  price?: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: mongoose.Types.ObjectId;
  images: string[];
  imageLabels?: string[];
  sizes?: IProductSize[];
  brand?: string;
  ratings: number;

  order: {
  type: Number,
  default: 0,
};

  isFeatured: boolean;
  isBestSeller?: boolean;
  isDisabled: boolean;
  isValuePack?: boolean;
  keyBenefits?: string[];
  naturalIngredients?: string[];
  howToUse?: string;
  precautions?: string;
  ourQuality?: string;
  badge?: string;
  subTitle?: string;
  whichIncluded?: IProductIncludedItem[];
  inStock?: boolean;
  stock?: number;
  weight?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    images: {
      type: [String],
      default: [],
    },
    imageLabels: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [
        {
          name: { type: String, required: true },
          price: { type: Number, required: true },
          originalPrice: { type: Number },
        },
      ],
      default: [],
    },
    brand: {
      type: String,
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    isValuePack: {
      type: Boolean,
      default: false,
    },
    keyBenefits: {
      type: [String],
      default: [],
    },
    naturalIngredients: {
      type: [String],
      default: [],
    },
    howToUse: {
      type: String,
      default: "",
    },
    precautions: {
      type: String,
      default: "",
    },
    ourQuality: {
      type: String,
      default: "",
    },
    badge: {
      type: String,
      default: "",
    },
    subTitle: {
      type: String,
      default: "",
      trim: true,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: 100,
      min: 0,
    },
    weight: {
      type: String,
      default: "",
      trim: true,
    },
    whichIncluded: {
      type: [Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
    strict: false,
  },
);

ProductSchema.index({ isDisabled: 1, isBestSeller: 1, order: 1 });
ProductSchema.index({ isDisabled: 1, isValuePack: 1, order: 1 });
ProductSchema.index({ isDisabled: 1, order: 1 });
ProductSchema.index({ slug: 1 });

if (mongoose.models && mongoose.models.Product) {
  delete (mongoose.models as any).Product;
}

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
