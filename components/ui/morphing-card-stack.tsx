"use client";

import { useState, type ReactNode } from "react";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  type PanInfo,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { Grid3X3, Layers, LayoutList } from "lucide-react";

export type LayoutMode = "stack" | "grid" | "list";

export interface CardData {
  id: string;
  title: string;
  description: string;
  icon?: ReactNode;
  color?: string;
  imageUrl?: string;
}

export interface MorphingCardStackProps {
  cards?: CardData[];
  className?: string;
  defaultLayout?: LayoutMode;
  onCardClick?: (card: CardData) => void;
}

const layoutIcons = {
  stack: Layers,
  grid: Grid3X3,
  list: LayoutList,
};

const SWIPE_THRESHOLD = 50;

export function Component({
  cards = [],
  className,
  defaultLayout = "stack",
  onCardClick,
}: MorphingCardStackProps) {
  const [layout, setLayout] = useState<LayoutMode>(defaultLayout);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  if (!cards || cards.length === 0) {
    return null;
  }

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const { offset, velocity } = info;
    const swipe = Math.abs(offset.x) * velocity.x;

    if (offset.x < -SWIPE_THRESHOLD || swipe < -1000) {
      // Swiped left - go to next card
      setActiveIndex((prev) => (prev + 1) % cards.length);
    } else if (offset.x > SWIPE_THRESHOLD || swipe > 1000) {
      // Swiped right - go to previous card
      setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }
    setIsDragging(false);
  };

  const getStackOrder = () => {
    const reordered = [];
    for (let i = 0; i < cards.length; i++) {
      const index = (activeIndex + i) % cards.length;
      reordered.push({ ...cards[index], stackPosition: i });
    }
    return reordered.reverse(); // Reverse so top card renders last (on top)
  };

  const getLayoutStyles = (stackPosition: number) => {
    switch (layout) {
      case "stack":
        return {
          top: stackPosition * 8,
          left: stackPosition * 8,
          zIndex: cards.length - stackPosition,
          rotate: (stackPosition - 1) * 2,
        };
      case "grid":
        return {
          top: 0,
          left: 0,
          zIndex: 1,
          rotate: 0,
        };
      case "list":
        return {
          top: 0,
          left: 0,
          zIndex: 1,
          rotate: 0,
        };
    }
  };

  const containerStyles = {
    stack: "relative h-96 w-96",
    grid: "grid grid-cols-2 gap-4",
    list: "flex flex-col gap-4",
  };

  const displayCards =
    layout === "stack"
      ? getStackOrder()
      : cards.map((c, i) => ({ ...c, stackPosition: i }));

  return (
    <div className={cn("space-y-4", className)}>
      {/* Layout Toggle */}
      <div className="flex items-center justify-center gap-1 rounded-lg bg-secondary/50 p-1 w-fit mx-auto">
        {(Object.keys(layoutIcons) as LayoutMode[]).map((mode) => {
          const Icon = layoutIcons[mode];
          return (
            <button
              key={mode}
              onClick={() => setLayout(mode)}
              className={cn(
                "rounded-md p-2 transition-all",
                layout === mode
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
              aria-label={`Switch to ${mode} layout`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      {/* Cards Container */}
      <LayoutGroup>
        <motion.div layout className={cn(containerStyles[layout], "mx-auto")}>
          <AnimatePresence mode="popLayout">
            {displayCards.map((card) => {
              const styles = getLayoutStyles(card.stackPosition);
              const isExpanded = expandedCard === card.id;
              const isTopCard = layout === "stack" && card.stackPosition === 0;

              return (
                <motion.div
                  key={card.id}
                  layoutId={card.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: isExpanded ? 1.05 : 1,
                    x: 0,
                    ...styles,
                  }}
                  exit={{ opacity: 0, scale: 0.8, x: -200 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  drag={isTopCard ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ scale: 1.02, cursor: "grabbing" }}
                  onClick={() => {
                    if (isDragging) return;
                    setExpandedCard(isExpanded ? null : card.id);
                    onCardClick?.(card);
                  }}
                  className={cn(
                    "cursor-pointer rounded-xl border border-border",
                    "hover:border-primary/50 transition-colors",
                    "relative overflow-hidden",
                    layout === "stack" && "absolute w-80 h-72",
                    layout === "stack" &&
                      isTopCard &&
                      "cursor-grab active:cursor-grabbing",
                    layout === "grid" && "w-full aspect-square",
                    layout === "list" && "w-full",
                    isExpanded && "ring-2 ring-primary",
                    "p-4"
                  )}
                  style={{
                    backgroundColor: card.color || "hsl(0 0% 100%)",
                    opacity: 1,
                  }}
                >
                  <div className="flex h-full flex-col">
                    {card.imageUrl ? (
                      <>
                        <div className="mb-3">
                          <h3 className="font-semibold text-card-foreground truncate">
                            {card.title}
                          </h3>
                          <p
                            className={cn(
                              "text-sm text-muted-foreground mt-1",
                              layout === "stack" && "line-clamp-1",
                              layout === "grid" && "line-clamp-1",
                              layout === "list" && "line-clamp-1"
                            )}
                          >
                            {card.description}
                          </p>
                        </div>
                        <div className="flex-1 overflow-hidden rounded-lg cursor-default">
                          <img
                            src={card.imageUrl}
                            alt={card.title}
                            className="h-full w-full object-cover cursor-default"
                          />
                        </div>
                      </>
                    ) : !card.icon && !card.description ? (
                      // Center the title when there's no icon and no description
                      <div className="flex flex-1 items-center justify-center">
                        <h3
                          className={cn(
                            "font-semibold text-card-foreground text-center",
                            layout === "stack" &&
                              "text-4xl md:text-5xl lg:text-6xl",
                            layout === "grid" && "text-xl md:text-2xl",
                            layout === "list" && "text-lg md:text-xl"
                          )}
                        >
                          {card.title}
                        </h3>
                      </div>
                    ) : (
                      <>
                        <div className="mb-3">
                          <h3 className="font-semibold text-card-foreground truncate">
                            {card.title}
                          </h3>
                        </div>
                        <div className="flex flex-1 items-start gap-3">
                          {card.icon && (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                              {card.icon}
                            </div>
                          )}
                          {card.description && (
                            <div className="min-w-0 flex-1">
                              <p
                                className={cn(
                                  "text-sm text-muted-foreground mt-1",
                                  layout === "stack" && "line-clamp-3",
                                  layout === "grid" && "line-clamp-2",
                                  layout === "list" && "line-clamp-1"
                                )}
                              >
                                {card.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {layout === "stack" && cards.length > 1 && (
        <>
          <div className="text-center -mt-4">
            <span className="text-xs text-muted-foreground/50">
              Swipe to navigate
            </span>
          </div>
          <div className="flex justify-center gap-1.5">
            {cards.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === activeIndex
                    ? "w-4 bg-primary"
                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
