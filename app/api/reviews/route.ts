import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import "@/models/Product"; // Ensure Product model is registered

// GET latest public product reviews for Testimonials homepage widget
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const reviews = await Review.find()
      .populate("product", "name slug images image")
      .sort({ createdAt: -1 })
      .limit(15);

    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error("Fetch testimonials reviews error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
