"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useOfferings } from "../hooks/useOfferings";
import { financeRepository } from "@/lib/repositories/financeRepository";
import { useToastContext } from "@/components/ToastProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OfferingForm } from "./OfferingForm";
import { OfferingTable } from "./OfferingTable";
import type {
  Offering,
  CreateOfferingInput,
  UpdateOfferingInput,
} from "../types/finance.types";
import type { PaginationInfo } from "../types/finance.types";

interface OfferingsManagementProps {
  initialData: {
    offerings: Offering[];
    pagination: PaginationInfo | null;
  };
}

export function OfferingsManagement({ initialData }: OfferingsManagementProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: showError, showAlert } = useToastContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<Offering | null>(null);

  const { offerings, pagination, loading, loadOfferings } = useOfferings({
    initialOfferings: initialData.offerings,
    initialPagination: initialData.pagination,
    onError: (error) => showError("Error", error, 3000),
  });

  const handleCreate = () => {
    setEditingOffering(null);
    setIsFormOpen(true);
  };

  const handleEdit = (offering: Offering) => {
    setEditingOffering(offering);
    setIsFormOpen(true);
  };

  const handleSubmit = async (
    data: CreateOfferingInput | UpdateOfferingInput
  ) => {
    try {
      if (editingOffering) {
        await financeRepository.updateOffering(
          editingOffering.id,
          data as UpdateOfferingInput
        );
        success("Updated!", "Offering updated successfully", 2000);
      } else {
        await financeRepository.createOffering(data as CreateOfferingInput);
        success("Created!", "Offering created successfully", 2000);
      }
      setIsFormOpen(false);
      setEditingOffering(null);
      const currentPage = pagination?.page || 1;
      await loadOfferings(currentPage);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save offering";
      showError("Error", errorMessage, 3000);
      throw error;
    }
  };

  const handleDelete = async (offering: Offering) => {
    const confirmed = await showAlert(
      "Delete Offering",
      `Are you sure you want to delete this offering of ${new Intl.NumberFormat(
        "en-PH",
        {
          style: "currency",
          currency: "PHP",
        }
      ).format(offering.amount)}?`,
      "Delete",
      "Cancel"
    );

    if (confirmed) {
      try {
        await financeRepository.deleteOffering(offering.id);
        success("Deleted!", "Offering deleted successfully", 2000);
        const currentPage = pagination?.page || 1;
        await loadOfferings(currentPage);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete offering";
        showError("Error", errorMessage, 3000);
      }
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingOffering(null);
  };

  return (
    <div className="space-y-3 md:space-y-6">
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg md:text-xl">Offerings</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Manage offerings records
              </CardDescription>
            </div>
            <Button
              onClick={handleCreate}
              size="sm"
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Offering
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <OfferingTable
            offerings={offerings}
            pagination={pagination}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => !open && handleCancel()}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingOffering ? "Edit Offering" : "Add Offering"}
            </DialogTitle>
            <DialogDescription>
              {editingOffering
                ? "Update the offering information below."
                : "Fill in the details to create a new offering record."}
            </DialogDescription>
          </DialogHeader>
          <OfferingForm
            offering={editingOffering}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
