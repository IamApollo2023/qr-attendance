"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Upload } from "lucide-react";
import type { ActivityAlbum } from "@/types";
import {
  PreviewGrid,
  type PreviewItem,
} from "@/features/activities/components/PreviewGrid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type OrderedPreviewItem = PreviewItem & { order: number };

interface AlbumFormProps {
  isOpen: boolean;
  album?: ActivityAlbum | null;
  onSubmit: (
    caption: string,
    orderedImages: OrderedPreviewItem[],
    deletedImageIds: string[],
    coverImageId: string | null
  ) => Promise<void>;
  onCancel: () => void;
}

function withCoverApplied(items: PreviewItem[]) {
  if (items.some((item) => item.isCover)) return items;
  if (items.length === 0) return items;
  const [first, ...rest] = items;
  return [{ ...first, isCover: true }, ...rest];
}

export function AlbumForm({
  isOpen,
  album,
  onSubmit,
  onCancel,
}: AlbumFormProps) {
  const [caption, setCaption] = useState(album?.caption || "");
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>(() =>
    withCoverApplied(
      album?.images?.map((img, index) => ({
        id: img.id,
        url: img.image_url,
        type: "existing" as const,
        isCover: index === 0,
      })) || []
    )
  );
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const coverImageId = useMemo(
    () => previewItems.find((item) => item.isCover)?.id ?? null,
    [previewItems]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const mapped = files.map<PreviewItem>((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      type: "new",
      file,
    }));

    setPreviewItems((prev) => withCoverApplied([...prev, ...mapped]));
    e.target.value = "";
  };

  const handleDelete = (id: string) => {
    setPreviewItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (!target) return prev;

      const next = prev.filter((item) => item.id !== id);
      if (target.type === "existing") {
        setDeletedImageIds((current) => [...current, target.id]);
      }

      if (target.isCover && next.length > 0) {
        const [first, ...rest] = next;
        return [
          { ...first, isCover: true },
          ...rest.map((item) => ({ ...item, isCover: false })),
        ];
      }

      return next;
    });
  };

  const handleCoverSelect = (id: string) => {
    setPreviewItems((prev) =>
      prev.map((item) => ({
        ...item,
        isCover: item.id === id,
      }))
    );
  };

  const handleReorder = (items: PreviewItem[]) => {
    const coverId = items.find((item) => item.isCover)?.id;
    setPreviewItems(
      items.map((item) => ({
        ...item,
        isCover: coverId ? item.id === coverId : item.isCover,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      return;
    }

    const orderedImages: OrderedPreviewItem[] = previewItems.map(
      (item, index) => ({
        ...item,
        order: index,
      })
    );

    setUploading(true);
    try {
      await onSubmit(caption, orderedImages, deletedImageIds, coverImageId);
    } finally {
      setUploading(false);
    }
  };

  // Reset form when dialog opens or album changes
  useEffect(() => {
    if (isOpen) {
      setCaption(album?.caption || "");
      setPreviewItems(
        withCoverApplied(
          album?.images?.map((img, index) => ({
            id: img.id,
            url: img.image_url,
            type: "existing" as const,
            isCover: index === 0,
          })) || []
        )
      );
      setDeletedImageIds([]);
    }
  }, [isOpen, album]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{album ? "Edit Album" : "Create Album"}</DialogTitle>
          <DialogDescription>
            {album
              ? "Update the album details and images."
              : "Create a new album with a name and images."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Album name"
          />

          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-4 text-base text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
            >
              <Upload className="h-5 w-5 text-gray-400" />
              <span>Upload Images</span>
            </button>

            {previewItems.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {previewItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
                  >
                    <img
                      src={item.url}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    {item.isCover && (
                      <div className="absolute top-0.5 left-0.5 bg-blue-600 text-white text-[10px] px-1 py-0.5 rounded font-semibold">
                        Cover
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="absolute top-0.5 right-0.5 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center hover:bg-red-700 text-[10px] leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading || !caption.trim()}>
              {uploading ? "Saving..." : album ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
