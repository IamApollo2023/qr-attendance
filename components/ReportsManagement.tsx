"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Component } from "@/components/ui/morphing-card-stack";
import type { CardData } from "@/components/ui/morphing-card-stack";
import { Users } from "lucide-react";
import type { AgeGroupData } from "@/lib/reports";

interface ReportsManagementProps {
  initialData: {
    ageGroups: AgeGroupData[];
  };
}

export default function ReportsManagement({
  initialData,
}: ReportsManagementProps) {
  const router = useRouter();
  const [ageGroups] = useState<AgeGroupData[]>(initialData.ageGroups);

  const transformAgeGroupsToCards = (ageGroups: AgeGroupData[]): CardData[] => {
    return ageGroups.map((ageGroup) => {
      return {
        id: ageGroup.key,
        title: ageGroup.name,
        description: "", // Empty description
        color: "hsl(0 0% 100%)", // White for all cards
      };
    });
  };

  const handleCardClick = (card: CardData) => {
    router.push(`/admin/report/${card.id}`);
  };

  const cards = transformAgeGroupsToCards(ageGroups);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Header */}
        <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <div>
            <h1 className="text-lg md:text-3xl font-semibold tracking-tight">
              Report
            </h1>
            <p className="text-xs md:text-base text-muted-foreground">
              View age groups and attendance statistics.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 lg:px-6">
          {ageGroups.length === 0 ? (
            <div className="p-12 text-center flex-1 flex items-center justify-center flex-col">
              <p className="text-gray-700 text-sm md:text-base">
                No age groups found
              </p>
            </div>
          ) : (
            <Component
              cards={cards}
              defaultLayout="grid"
              className="w-full"
              onCardClick={handleCardClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
