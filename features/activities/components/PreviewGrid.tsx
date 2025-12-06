"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type PreviewItem = {
  id: string;
  url: string;
  type: "existing" | "new";
  file?: File;
  isCover?: boolean;
};

interface PreviewGridProps {
  title: string;
  items: PreviewItem[];
  onReorder: (items: PreviewItem[]) => void;
  onDelete: (id: string) => void;
  onCoverSelect: (id: string) => void;
  emptyHint?: string;
}

function SortableCard({
  item,
  onDelete,
  onCoverSelect,
  itemClassName,
}: {
  item: PreviewItem;
  onDelete: (id: string) => void;
  onCoverSelect: (id: string) => void;
  itemClassName?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-transform",
        itemClassName,
        isDragging ? "ring-2 ring-blue-500 shadow-lg" : ""
      )}
    >
      <img
        src={item.url}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
      />

      {item.isCover && (
        <div className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
          Cover
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold uppercase text-gray-700 shadow-sm transition hover:bg-white"
            onClick={() => onCoverSelect(item.id)}
          >
            <Star
              className={cn(
                "h-3.5 w-3.5",
                item.isCover ? "fill-blue-500 text-blue-500" : "text-gray-500"
              )}
            />
            {item.isCover ? "Cover" : "Set cover"}
          </button>

          <button
            type="button"
            className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm transition hover:bg-white"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          className="pointer-events-auto inline-flex items-center justify-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold uppercase text-gray-700 shadow-sm transition hover:bg-white"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-3.5 w-3.5" />
          Drag
        </button>
      </div>
    </div>
  );
}

export function PreviewGrid({
  title,
  items,
  onReorder,
  onDelete,
  onCoverSelect,
  emptyHint = "Add images to preview",
  itemClassName,
}: PreviewGridProps & { itemClassName?: string }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(items, oldIndex, newIndex);
    onReorder(reordered);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <span className="text-xs text-gray-500">{items.length} selected</span>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
        {items.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-xs text-gray-500">
            {emptyHint}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <SortableCard
                    key={item.id}
                    item={item}
                    onDelete={onDelete}
                    onCoverSelect={onCoverSelect}
                    itemClassName={itemClassName}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
