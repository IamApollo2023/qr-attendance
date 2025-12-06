/**
 * Create a thumbnail version of an image for preview
 * Uses canvas to resize the image on the client side
 */
export async function createThumbnail(
  imageUrl: string,
  maxWidth: number = 300,
  maxHeight: number = 300
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = imageUrl;
  });
}

/**
 * Create thumbnail from File object
 */
export async function createThumbnailFromFile(
  file: File,
  maxWidth: number = 300,
  maxHeight: number = 300
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const thumbnail = await createThumbnail(
            e.target?.result as string,
            maxWidth,
            maxHeight
          );
          resolve(thumbnail);
        } catch (error) {
          // Fallback to original file URL
          resolve(URL.createObjectURL(file));
        }
      };
      img.onerror = () => {
        // Fallback to original file URL
        resolve(URL.createObjectURL(file));
      };
      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Get optimized image URL for preview
 * For now, returns original URL but can be extended to use CDN or image service
 */
export function getPreviewImageUrl(imageUrl: string): string {
  // In the future, you could integrate with an image CDN like:
  // - Supabase Image Transform (if available)
  // - Cloudinary
  // - Imgix
  // For now, return original URL
  return imageUrl;
}
