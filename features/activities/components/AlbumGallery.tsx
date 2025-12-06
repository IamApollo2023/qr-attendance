"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import type { ActivityAlbum } from "@/types";

interface AlbumGalleryProps {
  album: ActivityAlbum;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AlbumGallery({
  album,
  onClose,
  onEdit,
  onDelete,
}: AlbumGalleryProps) {
  const images = album.images || [];

  if (images.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{album.caption}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 mb-4">No images in this album.</p>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">{album.caption}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 pt-20">
        <div className="mx-auto max-w-4xl grid grid-cols-2 gap-3 sm:gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-xl bg-black/5"
            >
              <img
                src={img.image_url}
                alt={album.caption}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
