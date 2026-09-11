import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { generateSlug } from "@/lib/utils";
import { buildProductImageVariants } from "@/lib/productImages";

const PRODUCT_CARD_FIELDS =
  "name slug price originalPrice images ratings category badge subTitle isBestSeller isValuePack isDisabled inStock stock order sizes weight";

let homeProductsCache: {
  timestamp: number;
  data: {
    bestSellers: any[];
    regularProducts: any[];
    valuePacks: any[];
  };
} | null = null;

const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function clearHomeProductsCache() {
  homeProductsCache = null;
}

export function formatProductForCard(product: any) {
  const plain =
    typeof product?.toObject === "function" ? product.toObject() : product;
  const oldPrice =
    typeof plain?.originalPrice === "number" ? plain.originalPrice : undefined;
  const slug = plain?.slug || generateSlug(plain?.name || "product");

  return {
    _id: String(plain._id),
    name: plain.name || "",
    slug,
    price: plain.price || 0,
    newPrice: plain.price,
    oldPrice,
    originalPrice: plain.originalPrice,
    images: Array.isArray(plain.images) ? plain.images : [],
    ratings: typeof plain.ratings === "number" ? plain.ratings : 5.0,
    category: plain.category
      ? {
          _id: String(plain.category._id || plain.category),
          name: plain.category.name || "",
          slug: plain.category.slug || "",
        }
      : null,
    badge: plain.badge || "",
    subTitle: plain.subTitle || "",
    isBestSeller: Boolean(plain.isBestSeller),
    isFeatured: Boolean(plain.isFeatured),
    isValuePack: Boolean(plain.isValuePack),
    inStock: plain.inStock !== false && (typeof plain.stock !== "number" || plain.stock > 0),
    stock: typeof plain.stock === "number" ? plain.stock : 100,
    weight: plain.weight || "",
    order: typeof plain.order === "number" ? plain.order : 0,
    sizes: Array.isArray(plain.sizes)
      ? plain.sizes.map((sz: any) => ({
          name: sz.name || "",
          price: sz.price || 0,
          originalPrice: sz.originalPrice,
          _id: sz._id ? String(sz._id) : undefined,
        }))
      : [],
    imageVariants: buildProductImageVariants(plain),
  };
}

export async function getHomeProductsData() {
  const now = Date.now();
  if (homeProductsCache && now - homeProductsCache.timestamp < CACHE_TTL_MS) {
    return homeProductsCache.data;
  }

  try {
    await connectDB();

    const [bestSellersRaw, regularRaw, valuePacksRaw] = await Promise.all([
      Product.find({ isDisabled: { $ne: true }, isBestSeller: true })
        .select(PRODUCT_CARD_FIELDS)
        .populate("category", "name slug")
        .sort("order")
        .limit(12)
        .lean(),
      Product.find({
        isDisabled: { $ne: true },
        isValuePack: { $ne: true },
      })
        .select(PRODUCT_CARD_FIELDS)
        .populate("category", "name slug")
        .sort("order")
        .limit(100)
        .lean(),
      Product.find({ isDisabled: { $ne: true }, isValuePack: true })
        .select(PRODUCT_CARD_FIELDS)
        .populate("category", "name slug")
        .sort("order")
        .limit(10)
        .lean(),
    ]);

    const bestSellers = bestSellersRaw.map(formatProductForCard);
    const regularProducts = regularRaw.map(formatProductForCard);
    const valuePacks = valuePacksRaw.map(formatProductForCard);

    const result = JSON.parse(
      JSON.stringify({
        bestSellers,
        regularProducts,
        valuePacks,
      })
    );

    homeProductsCache = {
      timestamp: now,
      data: result,
    };

    return result;
  } catch (error) {
    console.error("Error fetching home products server-side:", error);
    return {
      bestSellers: [],
      regularProducts: [],
      valuePacks: [],
    };
  }
}
