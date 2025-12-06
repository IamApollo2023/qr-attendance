"use client";

import { ChevronLeft, ChevronRight, X, Edit, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { ActivityAlbum } from "@/types";
import { getPreviewImageUrl } from "@/features/activities/utils/imageUtils";

interface AnimatedAlbumsProps {
  albums: ActivityAlbum[];
  autoplay?: boolean;
  className?: string;
  onAlbumClick?: (album: ActivityAlbum) => void;
  onEdit?: (album: ActivityAlbum) => void;
  onDelete?: (album: ActivityAlbum) => void;
}

export const AnimatedAlbums = ({
  albums,
  autoplay = false,
  className,
  onAlbumClick,
  onEdit,
  onDelete,
}: AnimatedAlbumsProps) => {
  // Filter albums that have at least one image
  const albumsWithImages = albums.filter(
    (album) => album.images && album.images.length > 0
  );

  if (albumsWithImages.length === 0) {
    return (
      <div className={cn("text-center py-20 text-muted-foreground", className)}>
        <p>No albums with images to display.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-12 md:space-y-16", className)}>
      {albumsWithImages.map((album, index) => (
        <div key={album.id}>
          <AlbumCarousel
            album={album}
            autoplay={autoplay}
            onAlbumClick={onAlbumClick}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          {index < albumsWithImages.length - 1 && (
            <div className="mt-12 md:mt-16 border-t border-gray-200" />
          )}
        </div>
      ))}
    </div>
  );
};

interface AlbumCarouselProps {
  album: ActivityAlbum;
  autoplay?: boolean;
  onAlbumClick?: (album: ActivityAlbum) => void;
  onEdit?: (album: ActivityAlbum) => void;
  onDelete?: (album: ActivityAlbum) => void;
}

function AlbumCarousel({
  album,
  autoplay = false,
  onAlbumClick,
  onEdit,
  onDelete,
}: AlbumCarouselProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const images = album.images || [];

  if (images.length === 0) return null;

  const handleNext = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (autoplay && images.length > 1) {
      const interval = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, images.length]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const activeImage = images[activeImageIndex];
  const imageUrl = getPreviewImageUrl(activeImage.image_url);

  return (
    <>
      <div className="max-w-sm md:max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Image Preview */}
          <div>
            <div
              className="relative h-48 md:h-64 w-full rounded-3xl overflow-hidden cursor-pointer group"
              onClick={() => setIsDialogOpen(true)}
            >
              <Image
                src={imageUrl}
                alt={album.caption || "Album image"}
                width={500}
                height={500}
                draggable={false}
                className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium">
                  Click to view images
                </div>
              </div>
              {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
                  {images.length} images
                </div>
              )}
            </div>
          </div>

          {/* Album Info */}
          <div className="flex justify-between flex-col py-4">
            <motion.div
              key={`${album.id}-${activeImageIndex}`}
              initial={{
                y: 20,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-2xl font-bold text-foreground flex-1">
                  {album.caption || "Untitled Album"}
                </h3>
                <div className="flex gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(album)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                      title="Edit album"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to delete "${album.caption}"?`
                          )
                        ) {
                          onDelete(album);
                        }
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                      title="Delete album"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {images.length} image{images.length !== 1 ? "s" : ""} •{" "}
                {formatDate(album.created_at)}
              </p>
              <motion.p className="text-lg text-muted-foreground mt-8">
                {album.caption.split(" ").map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{
                      filter: "blur(10px)",
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      filter: "blur(0px)",
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut",
                      delay: 0.02 * index,
                    }}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Image Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">{album.caption}</h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Image Display */}
          <div className="flex-1 flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage.id}
                src={getPreviewImageUrl(activeImage.image_url)}
                alt={`${album.caption} - Image ${activeImageIndex + 1}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="max-w-full max-h-full object-contain"
                loading="eager"
              />
            </AnimatePresence>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Footer with thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === activeImageIndex
                        ? "border-white scale-110"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={getPreviewImageUrl(img.image_url)}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
              <div className="text-center text-white text-sm mt-2">
                {activeImageIndex + 1} / {images.length}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
