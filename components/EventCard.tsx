"use client";

import { ArrowRight, Users, Calendar, UserCheck, Loader2 } from "lucide-react";
import type { Event, EventStats } from "@/types";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  event: Event;
  stats: EventStats;
  isActive: boolean;
  onSetActive?: (eventId: string) => void;
  onDeactivate?: () => void;
  isLoading?: boolean;
}

export function EventCard({
  event,
  stats,
  isActive,
  onSetActive,
  onDeactivate,
  isLoading,
}: EventCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/admin/attendance/${event.id}`);
  };

  const handleSetActiveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSetActive?.(event.id);
  };

  const handleDeactivateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeactivate?.();
  };

  const isNightOfPower = event.name === "Night of Power";
  const isWorshipService = event.name === "Worship Service";
  const isLifeGroup = event.name === "Life Group";
  const isYouthZone = event.name === "Youth Zone";
  const hasImage =
    isNightOfPower || isWorshipService || isLifeGroup || isYouthZone;

  const getImageSrc = () => {
    if (isNightOfPower) return "/nop.jpg";
    if (isWorshipService) return "/ws.jpg";
    if (isLifeGroup) return "/lg.png";
    if (isYouthZone) return "/yz.png";
    return "";
  };

  const getImageAlt = () => {
    if (isNightOfPower) return "Night of Power";
    if (isWorshipService) return "Worship Service";
    if (isLifeGroup) return "Life Group";
    if (isYouthZone) return "Youth Zone";
    return "";
  };

  return (
    <div
      className={`group relative flex flex-col gap-4 p-0 bg-white rounded-lg border-2 transition-all duration-200 w-full overflow-hidden ${
        isActive
          ? "border-blue-500 shadow-lg shadow-blue-500/20"
          : "border-gray-200 hover:border-blue-500 hover:shadow-lg"
      }`}
    >
      {/* Pulsing ring around active card */}
      {isActive && (
        <div className="absolute -inset-0.5 rounded-lg bg-blue-500 opacity-20 animate-pulse -z-10" />
      )}
      {/* Active Badge with Pulse */}
      {isActive && (
        <div className="absolute top-4 right-4 z-10">
          <div className="relative">
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75" />
            {/* Badge */}
            <div className="relative px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full animate-pulse">
              Active
            </div>
          </div>
        </div>
      )}

      {/* Event Image */}
      {hasImage ? (
        <>
          <div className="relative w-full h-48">
            <Image
              src={getImageSrc()}
              alt={getImageAlt()}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>
          <div className="px-6 pb-2">
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {event.name}
            </h3>
            {event.description && (
              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
            )}
          </div>
        </>
      ) : (
        <div className="px-6 pt-6 pr-20">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {event.name}
          </h3>
          {event.description && (
            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className={`grid grid-cols-3 gap-4 ${hasImage ? "px-6" : "px-6"}`}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span className="text-xs">Total</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">
            {stats.total.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Today</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">
            {stats.today.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-gray-600">
            <UserCheck className="h-4 w-4" />
            <span className="text-xs">Unique</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">
            {stats.unique.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className={`flex flex-col gap-2 ${hasImage ? "px-6 pb-6" : "px-6 pb-6"}`}
      >
        <Button
          onClick={isActive ? handleDeactivateClick : handleSetActiveClick}
          disabled={isLoading}
          variant={isActive ? "default" : "outline"}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isActive ? "Deactivating..." : "Setting..."}
            </>
          ) : isActive ? (
            "Deactivate"
          ) : (
            "Set as Active"
          )}
        </Button>
        <Button onClick={handleCardClick} variant="outline" className="w-full">
          <span>View Details</span>
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
