export function isCloudinaryUrl(src?: string | null) {
  return typeof src === "string" && src.includes("res.cloudinary.com");
}

export function getOptimizedImageUrl(
  src?: string | null,
  width = 380,
  quality = "auto:eco"
): string {
  if (!src || typeof src !== "string" || !src.trim()) return "/homyorganic.png";

  if (src.includes("res.cloudinary.com") && src.includes("/upload/")) {
    const uploadIndex = src.indexOf("/upload/");
    const prefix = src.substring(0, uploadIndex + 8);
    let rest = src.substring(uploadIndex + 8);

    // Clean up existing transformation parameters to apply the requested width and quality
    while (/^(f_|q_|w_|c_|h_|dpr_)[^/]+\//.test(rest)) {
      rest = rest.replace(/^[^/]+\//, "");
    }

    return `${prefix}f_auto,q_${quality},w_${width},c_limit/${rest}`;
  }

  return src;
}

export function getVideoPosterUrl(src?: string | null, thumbnailTime = 0): string | undefined {
  if (!src || typeof src !== "string" || !src.trim()) return undefined;

  if (src.includes("res.cloudinary.com") && src.includes("/video/upload/")) {
    const uploadIndex = src.indexOf("/video/upload/");
    const prefix = src.substring(0, uploadIndex + 14);
    let rest = src.substring(uploadIndex + 14);

    while (/^(f_|q_|w_|c_|h_|dpr_|so_)[^/]+\//.test(rest)) {
      rest = rest.replace(/^[^/]+\//, "");
    }

    const fileName = rest.replace(/\.[^/.]+$/, "");
    const safeTime = Number.isFinite(thumbnailTime) && thumbnailTime >= 0 ? thumbnailTime : 0;
    return `${prefix}f_jpg,q_auto,so_${safeTime}/${fileName}.jpg`;
  }

  return undefined;
}

export function getOptimizedVideoUrl(src?: string | null): string | undefined {
  if (!src || typeof src !== "string" || !src.trim()) return undefined;

  if (src.includes("res.cloudinary.com") && src.includes("/video/upload/")) {
    const uploadIndex = src.indexOf("/video/upload/");
    const prefix = src.substring(0, uploadIndex + 14);
    let rest = src.substring(uploadIndex + 14);

    while (/^(f_|q_|w_|c_|h_|dpr_|so_|vc_|ac_)[^/]+\//.test(rest)) {
      rest = rest.replace(/^[^/]+\//, "");
    }

    const fileName = rest.replace(/\.[^/.]+$/, "");
    return `${prefix}f_mp4,vc_h264,ac_aac,q_auto,w_720,c_limit/${fileName}.mp4`;
  }

  return src;
}