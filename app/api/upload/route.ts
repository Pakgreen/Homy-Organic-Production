import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Only image and video files are allowed" },
        { status: 400 },
      );
    }

    // Keep uploads within a practical limit while allowing product videos.
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: `${isVideo ? "Video" : "Image"} size exceeds 100MB limit! Please select a smaller file.`,
        },
        { status: 400 },
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    // Upload to Cloudinary
    const body = formData.get("folder");
    const destFolder = body ? (body as string).trim() : "xenzoxmart";
    const uploadResponse = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: destFolder,
          resource_type: isVideo ? "video" : "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      uploadStream.end(buffer);
    });

    console.log(
      `✅ ${isVideo ? "Video" : "Image"} uploaded successfully:`,
      uploadResponse.secure_url,
    );

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    });
  } catch (error: any) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Failed to upload image",
        details:
          process.env.NODE_ENV === "development"
            ? error?.toString()
            : undefined,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 },
      );
    }

    // Extract public ID from Cloudinary URL
    // Typical format: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<folder>/<public_id>.<ext>
    const urlParts = url.split("/");
    const fileWithExtension = urlParts[urlParts.length - 1];
    const fileWithoutExtension = fileWithExtension.split(".")[0];

    // Check if it's in a folder (like 'xenzoxmart')
    const folderIndex = urlParts.findIndex((part) => part === "upload") + 2; // +1 for version, +2 for folder
    const hasFolder = folderIndex < urlParts.length - 1;

    let publicId = fileWithoutExtension;
    if (hasFolder) {
      const folderName = urlParts
        .slice(folderIndex, urlParts.length - 1)
        .join("/");
      publicId = `${folderName}/${fileWithoutExtension}`;
    }

    // Attempt to delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    console.log(`✅ Image deleted from Cloudinary: ${publicId}`, result);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("❌ Delete error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete image" },
      { status: 500 },
    );
  }
}
