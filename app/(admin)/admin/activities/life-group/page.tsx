"use client";

import { useActivityAlbums } from "@/features/activities/hooks/useActivityAlbums";
import { ActivityAlbumGrid } from "@/features/activities/components/ActivityAlbumGrid";
import { useToastContext } from "@/components/ToastProvider";
import type { OrderedPreviewItem } from "@/features/activities/components/AlbumForm";
import type { OrderedImageInput } from "@/lib/activityAlbums";

export default function LifeGroupPage() {
  const { success, error: showError } = useToastContext();
  const { albums, loading, createAlbum, updateAlbum, removeAlbum } =
    useActivityAlbums({
      activityType: "life-group",
      onError: (error) => showError("Error", error, 3000),
    });

  const toOrderedPayload = (
    orderedImages: OrderedPreviewItem[]
  ): OrderedImageInput[] =>
    orderedImages.map((item) =>
      item.type === "existing"
        ? {
            type: "existing",
            id: item.id,
            order: item.order,
            isCover: item.isCover,
          }
        : {
            type: "new",
            file: item.file!,
            order: item.order,
            isCover: item.isCover,
          }
    );

  const handleCreateAlbum = async (
    caption: string,
    orderedImages: OrderedPreviewItem[],
    _coverImageId: string | null
  ) => {
    try {
      await createAlbum({
        activity_type: "life-group",
        caption,
        ordered_images: toOrderedPayload(orderedImages),
      });
      success("Created!", "Album created successfully", 2000);
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleUpdateAlbum = async (
    id: string,
    caption: string,
    orderedImages: OrderedPreviewItem[],
    deletedImageIds: string[],
    _coverImageId: string | null
  ) => {
    try {
      await updateAlbum(id, {
        caption,
        ordered_images: toOrderedPayload(orderedImages),
        deleted_image_ids: deletedImageIds,
      });
      success("Updated!", "Album updated successfully", 2000);
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (confirm("Are you sure you want to delete this album?")) {
      try {
        await removeAlbum(id);
        success("Deleted!", "Album deleted successfully", 2000);
      } catch (error) {
        // Error already handled by hook
      }
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-lg md:text-3xl font-semibold tracking-tight mb-2">
          Life Group
        </h1>
        <p className="text-xs md:text-base text-muted-foreground">
          Manage Life Group activity albums
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading albums...</div>
      ) : (
        <ActivityAlbumGrid
          albums={albums}
          loading={loading}
          onCreateAlbum={handleCreateAlbum}
          onUpdateAlbum={handleUpdateAlbum}
          onDeleteAlbum={handleDeleteAlbum}
        />
      )}
    </div>
  );
}
