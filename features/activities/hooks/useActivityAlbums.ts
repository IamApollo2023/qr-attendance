import { useState, useCallback, useEffect } from "react";
import {
  createActivityAlbum,
  getActivityAlbumsByType,
  updateActivityAlbum,
  deleteActivityAlbum,
  type CreateActivityAlbumInput,
  type UpdateActivityAlbumInput,
} from "@/lib/activityAlbums";
import type { ActivityAlbum, ActivityType } from "@/types";

interface UseActivityAlbumsProps {
  activityType: ActivityType;
  onError?: (error: string) => void;
}

/**
 * Hook for managing activity albums
 */
export function useActivityAlbums({
  activityType,
  onError,
}: UseActivityAlbumsProps) {
  const [albums, setAlbums] = useState<ActivityAlbum[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getActivityAlbumsByType(activityType);
      setAlbums(data);
    } catch (error) {
      console.error("Failed to load albums:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load albums";
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [activityType, onError]);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  const createAlbum = useCallback(
    async (input: CreateActivityAlbumInput) => {
      try {
        const newAlbum = await createActivityAlbum(input);
        setAlbums((prev) => [newAlbum, ...prev]);
        return newAlbum;
      } catch (error) {
        console.error("Failed to create album:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create album";
        onError?.(errorMessage);
        throw error;
      }
    },
    [onError]
  );

  const updateAlbum = useCallback(
    async (id: string, input: UpdateActivityAlbumInput) => {
      try {
        const updatedAlbum = await updateActivityAlbum(id, input);
        setAlbums((prev) =>
          prev.map((album) => (album.id === id ? updatedAlbum : album))
        );
        return updatedAlbum;
      } catch (error) {
        console.error("Failed to update album:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update album";
        onError?.(errorMessage);
        throw error;
      }
    },
    [onError]
  );

  const removeAlbum = useCallback(
    async (id: string) => {
      try {
        await deleteActivityAlbum(id);
        setAlbums((prev) => prev.filter((album) => album.id !== id));
      } catch (error) {
        console.error("Failed to delete album:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete album";
        onError?.(errorMessage);
        throw error;
      }
    },
    [onError]
  );

  return {
    albums,
    loading,
    loadAlbums,
    createAlbum,
    updateAlbum,
    removeAlbum,
  };
}
