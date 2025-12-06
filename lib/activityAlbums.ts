import { supabase } from "./supabase";
import type { ActivityAlbum, ActivityAlbumImage, ActivityType } from "@/types";

export type OrderedImageInput =
  | {
      type: "existing";
      id: string;
      order: number;
      isCover?: boolean;
    }
  | {
      type: "new";
      file: File;
      order: number;
      isCover?: boolean;
    };

export interface CreateActivityAlbumInput {
  activity_type: ActivityType;
  caption: string;
  images?: File[];
  ordered_images?: OrderedImageInput[];
}

export interface UpdateActivityAlbumInput {
  caption?: string;
  images?: File[];
  deleted_image_ids?: string[];
  ordered_images?: OrderedImageInput[];
}

const STORAGE_BUCKET = "activity-images";

/**
 * Check if storage bucket exists and is accessible
 * Uses direct bucket access instead of listing (which requires admin permissions)
 */
async function checkBucketExists(): Promise<boolean> {
  try {
    // Try to list files in the bucket (this will fail if bucket doesn't exist)
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list("", { limit: 1 });

    if (error) {
      if (
        error.message.includes("not found") ||
        error.message.includes("Bucket not found")
      ) {
        return false;
      }
      // Other errors (like permission denied) might mean bucket exists but we can't access it
      // In that case, we'll let the upload attempt handle it
      console.warn(
        "Bucket check returned error (may still exist):",
        error.message
      );
    }

    return true; // If no error or different error, assume bucket exists
  } catch (err) {
    console.error("Error checking bucket:", err);
    return false;
  }
}

/**
 * Upload image to Supabase Storage
 */
async function uploadImage(
  file: File,
  albumId: string,
  order: number
): Promise<string> {
  // Verify user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error(
      "You must be logged in to upload images. Please sign in and try again."
    );
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${albumId}/${Date.now()}-${order}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    // Provide more specific error messages
    const errorMsg = uploadError.message.toLowerCase();

    if (
      errorMsg.includes("bucket not found") ||
      errorMsg.includes("not found")
    ) {
      throw new Error(
        `Storage bucket '${STORAGE_BUCKET}' not found. Please verify it exists in Supabase Dashboard → Storage. The bucket should be named exactly 'activity-images' and marked as Public.`
      );
    }

    if (
      errorMsg.includes("permission") ||
      errorMsg.includes("policy") ||
      errorMsg.includes("denied") ||
      errorMsg.includes("unauthorized")
    ) {
      throw new Error(
        `Permission denied. Make sure you're logged in as an admin user. Current error: ${uploadError.message}`
      );
    }

    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Delete image from Supabase Storage
 */
async function deleteImage(imageUrl: string): Promise<void> {
  // Extract file path from URL
  const urlParts = imageUrl.split("/");
  const fileName = urlParts.slice(-2).join("/"); // Get albumId/filename

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([fileName]);

  if (error) {
    console.error("Failed to delete image:", error);
    // Don't throw - image might already be deleted
  }
}

/**
 * Create a new activity album
 */
export async function createActivityAlbum(
  input: CreateActivityAlbumInput
): Promise<ActivityAlbum> {
  // Create album first
  const { data: album, error: albumError } = await supabase
    .from("activity_albums")
    .insert({
      activity_type: input.activity_type,
      caption: input.caption,
    })
    .select()
    .single();

  if (albumError) {
    throw new Error(`Failed to create album: ${albumError.message}`);
  }

  const orderedUploads =
    input.ordered_images?.filter(
      (item): item is Extract<OrderedImageInput, { type: "new" }> =>
        item.type === "new"
    ) || [];

  // Upload images if provided (prefer ordered payload)
  if (orderedUploads.length > 0) {
    const imagePromises = orderedUploads.map((item) =>
      uploadImage(item.file, album.id, item.order).then((imageUrl) => ({
        album_id: album.id,
        image_url: imageUrl,
        image_order: item.order,
      }))
    );

    const imageData = await Promise.all(imagePromises);

    const { error: imagesError } = await supabase
      .from("activity_album_images")
      .insert(imageData);

    if (imagesError) {
      // Cleanup: delete album if image upload fails
      await supabase.from("activity_albums").delete().eq("id", album.id);
      throw new Error(`Failed to upload images: ${imagesError.message}`);
    }
  } else if (input.images && input.images.length > 0) {
    const imagePromises = input.images.map((file, index) =>
      uploadImage(file, album.id, index).then((imageUrl) => ({
        album_id: album.id,
        image_url: imageUrl,
        image_order: index,
      }))
    );

    const imageData = await Promise.all(imagePromises);

    const { error: imagesError } = await supabase
      .from("activity_album_images")
      .insert(imageData);

    if (imagesError) {
      // Cleanup: delete album if image upload fails
      await supabase.from("activity_albums").delete().eq("id", album.id);
      throw new Error(`Failed to upload images: ${imagesError.message}`);
    }
  }

  // Fetch album with images
  return getActivityAlbumById(album.id);
}

/**
 * Get album by ID with images
 */
export async function getActivityAlbumById(id: string): Promise<ActivityAlbum> {
  const { data: album, error: albumError } = await supabase
    .from("activity_albums")
    .select("*")
    .eq("id", id)
    .single();

  if (albumError) {
    throw new Error(`Failed to fetch album: ${albumError.message}`);
  }

  const { data: images, error: imagesError } = await supabase
    .from("activity_album_images")
    .select("*")
    .eq("album_id", id)
    .order("image_order", { ascending: true });

  if (imagesError) {
    throw new Error(`Failed to fetch images: ${imagesError.message}`);
  }

  return {
    ...album,
    images: images || [],
  } as ActivityAlbum;
}

/**
 * Get all albums for an activity type
 */
export async function getActivityAlbumsByType(
  activityType: ActivityType
): Promise<ActivityAlbum[]> {
  const { data: albums, error: albumsError } = await supabase
    .from("activity_albums")
    .select("*")
    .eq("activity_type", activityType)
    .order("created_at", { ascending: false });

  if (albumsError) {
    throw new Error(`Failed to fetch albums: ${albumsError.message}`);
  }

  // Fetch images for each album
  const albumsWithImages = await Promise.all(
    (albums || []).map(async (album) => {
      const { data: images } = await supabase
        .from("activity_album_images")
        .select("*")
        .eq("album_id", album.id)
        .order("image_order", { ascending: true });

      return {
        ...album,
        images: images || [],
      } as ActivityAlbum;
    })
  );

  return albumsWithImages;
}

/**
 * Update an activity album
 */
export async function updateActivityAlbum(
  id: string,
  input: UpdateActivityAlbumInput
): Promise<ActivityAlbum> {
  const updateData: any = {};

  if (input.caption !== undefined) {
    updateData.caption = input.caption;
  }

  // Update caption if provided
  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from("activity_albums")
      .update(updateData)
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to update album: ${error.message}`);
    }
  }

  // Delete images if specified
  if (input.deleted_image_ids && input.deleted_image_ids.length > 0) {
    // Get image URLs before deleting
    const { data: imagesToDelete } = await supabase
      .from("activity_album_images")
      .select("image_url")
      .in("id", input.deleted_image_ids);

    // Delete from database
    const { error: deleteError } = await supabase
      .from("activity_album_images")
      .delete()
      .in("id", input.deleted_image_ids);

    if (deleteError) {
      throw new Error(`Failed to delete images: ${deleteError.message}`);
    }

    // Delete from storage
    if (imagesToDelete) {
      await Promise.all(
        imagesToDelete.map((img) => deleteImage(img.image_url))
      );
    }
  }

  if (input.ordered_images && input.ordered_images.length > 0) {
    const existingItems = input.ordered_images.filter(
      (item): item is Extract<OrderedImageInput, { type: "existing" }> =>
        item.type === "existing"
    );
    const newItems = input.ordered_images.filter(
      (item): item is Extract<OrderedImageInput, { type: "new" }> =>
        item.type === "new"
    );

    if (existingItems.length > 0) {
      const updates = existingItems.map((item) => ({
        id: item.id,
        image_order: item.order,
      }));

      const { error } = await supabase
        .from("activity_album_images")
        .upsert(updates, { onConflict: "id" });

      if (error) {
        throw new Error(`Failed to reorder images: ${error.message}`);
      }
    }

    if (newItems.length > 0) {
      const imageData = await Promise.all(
        newItems.map((item) =>
          uploadImage(item.file, id, item.order).then((imageUrl) => ({
            album_id: id,
            image_url: imageUrl,
            image_order: item.order,
          }))
        )
      );

      const { error: imagesError } = await supabase
        .from("activity_album_images")
        .insert(imageData);

      if (imagesError) {
        throw new Error(`Failed to upload images: ${imagesError.message}`);
      }
    }
  } else if (input.images && input.images.length > 0) {
    // Fallback: append-only behavior for legacy callers
    const { data: currentImages } = await supabase
      .from("activity_album_images")
      .select("image_order")
      .eq("album_id", id)
      .order("image_order", { ascending: false })
      .limit(1);

    const startOrder =
      currentImages && currentImages.length > 0
        ? currentImages[0].image_order + 1
        : 0;

    const imagePromises = input.images.map((file, index) =>
      uploadImage(file, id, startOrder + index).then((imageUrl) => ({
        album_id: id,
        image_url: imageUrl,
        image_order: startOrder + index,
      }))
    );

    const imageData = await Promise.all(imagePromises);

    const { error: imagesError } = await supabase
      .from("activity_album_images")
      .insert(imageData);

    if (imagesError) {
      throw new Error(`Failed to upload images: ${imagesError.message}`);
    }
  }

  return getActivityAlbumById(id);
}

/**
 * Delete an activity album
 */
export async function deleteActivityAlbum(id: string): Promise<void> {
  // Get all images first
  const { data: images } = await supabase
    .from("activity_album_images")
    .select("image_url")
    .eq("album_id", id);

  // Delete from database (cascade will handle images, but we need URLs for storage)
  const { error } = await supabase
    .from("activity_albums")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete album: ${error.message}`);
  }

  // Delete images from storage
  if (images) {
    await Promise.all(images.map((img) => deleteImage(img.image_url)));
  }
}
