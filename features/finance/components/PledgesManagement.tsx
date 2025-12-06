"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { usePledges } from "../hooks/usePledges";
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
import { PledgeForm } from "./PledgeForm";
import { PledgeTable } from "./PledgeTable";
import type {
  Pledge,
  CreatePledgeInput,
  UpdatePledgeInput,
} from "../types/finance.types";
import type { PaginationInfo } from "../types/finance.types";

interface PledgesManagementProps {
  initialData: {
    pledges: Pledge[];
    pagination: PaginationInfo | null;
  };
}

export function PledgesManagement({ initialData }: PledgesManagementProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: showError, showAlert } = useToastContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPledge, setEditingPledge] = useState<Pledge | null>(null);

  const { pledges, pagination, loading, loadPledges } = usePledges({
    initialPledges: initialData.pledges,
    initialPagination: initialData.pagination,
    onError: (error) => showError("Error", error, 3000),
  });

  const handleCreate = () => {
    setEditingPledge(null);
    setIsFormOpen(true);
  };

  const handleEdit = (pledge: Pledge) => {
    setEditingPledge(pledge);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: CreatePledgeInput | UpdatePledgeInput) => {
    try {
      if (editingPledge) {
        await financeRepository.updatePledge(
          editingPledge.id,
          data as UpdatePledgeInput
        );
        success("Updated!", "Pledge updated successfully", 2000);
      } else {
        await financeRepository.createPledge(data as CreatePledgeInput);
        success("Created!", "Pledge created successfully", 2000);
      }
      setIsFormOpen(false);
      setEditingPledge(null);
      const currentPage = pagination?.page || 1;
      await loadPledges(currentPage);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save pledge";
      showError("Error", errorMessage, 3000);
      throw error;
    }
  };

  const handleDelete = async (pledge: Pledge) => {
    const confirmed = await showAlert({
      type: "warning",
      title: "Delete Pledge",
      message: `Are you sure you want to delete this pledge of ${new Intl.NumberFormat(
        "en-PH",
        {
          style: "currency",
          currency: "PHP",
        }
      ).format(pledge.amount)}?`,
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (confirmed) {
      try {
        await financeRepository.deletePledge(pledge.id);
        success("Deleted!", "Pledge deleted successfully", 2000);
        const currentPage = pagination?.page || 1;
        await loadPledges(currentPage);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete pledge";
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
    setEditingPledge(null);
  };

  return (
    <div className="space-y-3 md:space-y-6">
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg md:text-xl">Pledges</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Manage pledges records
              </CardDescription>
            </div>
            <Button
              onClick={handleCreate}
              size="sm"
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Pledge
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <PledgeTable
            pledges={pledges}
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
              {editingPledge ? "Edit Pledge" : "Add Pledge"}
            </DialogTitle>
            <DialogDescription>
              {editingPledge
                ? "Update the pledge information below."
                : "Fill in the details to create a new pledge record."}
            </DialogDescription>
          </DialogHeader>
          <PledgeForm
            pledge={editingPledge}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
