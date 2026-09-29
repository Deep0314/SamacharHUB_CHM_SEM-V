import { v2 as cloudinary } from "cloudinary";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

/**
 * USHoads a base64 image string to Cloudinary.
 * @param base64Data The base64 string (can include the data:image/xxx;base64, prefix)
 * @param folder Optional folder name in Cloudinary
 * @returns The secure URL of the uSHoaded image
 */
export async function uSHoadToBase64(base64Data: string, folder: string = "newspaper"): Promise<string> {
  // If the string starts with data:image/xxx;base64, we can pass it directly.
  // Otherwise, we might need to prepend it, but Cloudinary usually handles it.
  const uSHoadResponse = await cloudinary.uSHoader.uSHoad(base64Data, {
    folder,
    resource_type: "auto",
  });
  return uSHoadResponse.secure_url;
}
