"use client";

import { useState } from "react";
import { Component } from "@/components/ui/morphing-card-stack";
import type { CardData } from "@/components/ui/morphing-card-stack";
import { AlbumGallery } from "./AlbumGallery";
import { AlbumForm } from "./AlbumForm";
import { Plus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActivityAlbum } from "@/types";
import type { OrderedPreviewItem } from "./AlbumForm";
import { getPreviewImageUrl } from "@/features/activities/utils/imageUtils";

interface ActivityAlbumGridProps {
  albums: ActivityAlbum[];
  loading: boolean;
  onCreateAlbum: (
    caption: string,
    orderedImages: OrderedPreviewItem[],
    coverImageId: string | null
  ) => Promise<void>;
  onUpdateAlbum: (
    id: string,
    caption: string,
    orderedImages: OrderedPreviewItem[],
    deletedImageIds: string[],
    coverImageId: string | null
  ) => Promise<void>;
  onDeleteAlbum: (id: string) => Promise<void>;
}

export function ActivityAlbumGrid({
  albums,
  loading,
  onCreateAlbum,
  onUpdateAlbum,
  onDeleteAlbum,
}: ActivityAlbumGridProps) {
  const [selectedAlbum, setSelectedAlbum] = useState<ActivityAlbum | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<ActivityAlbum | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const transformAlbumsToCards = (albums: ActivityAlbum[]): CardData[] => {
    return albums.map((album) => {
      const coverImage =
        album.images?.find((img) => img.image_order === 0) || album.images?.[0];
      const imageUrl = coverImage
        ? getPreviewImageUrl(coverImage.image_url)
        : null;

      return {
        id: album.id,
        title: album.caption || "Untitled Album",
        description: `${album.images?.length || 0} image${(album.images?.length || 0) !== 1 ? "s" : ""} • ${formatDate(album.created_at)}`,
        imageUrl: imageUrl || undefined,
        icon: !imageUrl ? <ImageIcon className="h-5 w-5" /> : undefined,
      };
    });
  };

  const handleCardClick = (card: CardData) => {
    const album = albums.find((a) => a.id === card.id);
    if (album) {
      setSelectedAlbum(album);
    }
  };

  const handleCreateClick = () => {
    setEditingAlbum(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (album: ActivityAlbum) => {
    setEditingAlbum(album);
    setIsFormOpen(true);
    setSelectedAlbum(null);
  };

  const handleFormSubmit = async (
    caption: string,
    orderedImages: OrderedPreviewItem[],
    deletedImageIds: string[],
    coverImageId: string | null
  ) => {
    if (editingAlbum) {
      await onUpdateAlbum(
        editingAlbum.id,
        caption,
        orderedImages,
        deletedImageIds,
        coverImageId
      );
    } else {
      await onCreateAlbum(caption, orderedImages, coverImageId);
    }
    setIsFormOpen(false);
    setEditingAlbum(null);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingAlbum(null);
  };

  const handleDeleteClick = async (album: ActivityAlbum) => {
    if (confirm(`Are you sure you want to delete "${album.caption}"?`)) {
      await onDeleteAlbum(album.id);
      if (selectedAlbum?.id === album.id) {
        setSelectedAlbum(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading albums...
      </div>
    );
  }

  const cards = transformAlbumsToCards(albums);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-2xl font-semibold">Albums</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            {albums.length} album{albums.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          size="sm"
          className="text-xs md:text-sm"
        >
          <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
          <span className="hidden sm:inline">Create Album</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="mb-4">No albums yet.</p>
          <Button onClick={handleCreateClick} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create your first album
          </Button>
        </div>
      ) : (
        <Component
          cards={cards}
          onCardClick={handleCardClick}
          defaultLayout="grid"
        />
      )}

      {selectedAlbum && (
        <AlbumGallery
          album={selectedAlbum}
          onClose={() => setSelectedAlbum(null)}
          onEdit={() => handleEditClick(selectedAlbum)}
          onDelete={() => handleDeleteClick(selectedAlbum)}
        />
      )}

      <AlbumForm
        isOpen={isFormOpen}
        album={editingAlbum}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    </div>
  );
}
