"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useTithes } from "../hooks/useTithes";
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
import { TitheForm } from "./TitheForm";
import { TitheTable } from "./TitheTable";
import type {
  Tithe,
  CreateTitheInput,
  UpdateTitheInput,
} from "../types/finance.types";
import type { PaginationInfo } from "../types/finance.types";

interface TithesManagementProps {
  initialData: {
    tithes: Tithe[];
    pagination: PaginationInfo | null;
  };
}

export function TithesManagement({ initialData }: TithesManagementProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: showError, showAlert } = useToastContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTithe, setEditingTithe] = useState<Tithe | null>(null);

  const { tithes, pagination, loading, loadTithes } = useTithes({
    initialTithes: initialData.tithes,
    initialPagination: initialData.pagination,
    onError: (error) => showError("Error", error, 3000),
  });

  const handleCreate = () => {
    setEditingTithe(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tithe: Tithe) => {
    setEditingTithe(tithe);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: CreateTitheInput | UpdateTitheInput) => {
    try {
      if (editingTithe) {
        await financeRepository.updateTithe(
          editingTithe.id,
          data as UpdateTitheInput
        );
        success("Updated!", "Tithe updated successfully", 2000);
      } else {
        await financeRepository.createTithe(data as CreateTitheInput);
        success("Created!", "Tithe created successfully", 2000);
      }
      setIsFormOpen(false);
      setEditingTithe(null);
      const currentPage = pagination?.page || 1;
      await loadTithes(currentPage);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save tithe";
      showError("Error", errorMessage, 3000);
      throw error;
    }
  };

  const handleDelete = async (tithe: Tithe) => {
    const confirmed = await showAlert({
      type: "warning",
      title: "Delete Tithe",
      message: `Are you sure you want to delete this tithe of ${new Intl.NumberFormat(
        "en-PH",
        {
          style: "currency",
          currency: "PHP",
        }
      ).format(tithe.amount)}?`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (confirmed) {
      try {
        await financeRepository.deleteTithe(tithe.id);
        success("Deleted!", "Tithe deleted successfully", 2000);
        const currentPage = pagination?.page || 1;
        await loadTithes(currentPage);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete tithe";
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
    setEditingTithe(null);
  };

  return (
    <div className="space-y-3 md:space-y-6">
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg md:text-xl">Tithes</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Manage tithes records
              </CardDescription>
            </div>
            <Button
              onClick={handleCreate}
              size="sm"
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Tithe
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <TitheTable
            tithes={tithes}
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
              {editingTithe ? "Edit Tithe" : "Add Tithe"}
            </DialogTitle>
            <DialogDescription>
              {editingTithe
                ? "Update the tithe information below."
                : "Fill in the details to create a new tithe record."}
            </DialogDescription>
          </DialogHeader>
          <TitheForm
            tithe={editingTithe}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
