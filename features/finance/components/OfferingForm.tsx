"use client";

import { useState, useEffect } from "react";
import type {
  CreateOfferingInput,
  UpdateOfferingInput,
  Offering,
} from "../types/finance.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface OfferingFormProps {
  offering: Offering | null;
  onSubmit: (data: CreateOfferingInput | UpdateOfferingInput) => Promise<void>;
  onCancel: () => void;
}

export function OfferingForm({
  offering,
  onSubmit,
  onCancel,
}: OfferingFormProps) {
  const [formData, setFormData] = useState({
    amount: offering?.amount || "",
    date: offering?.date || new Date().toISOString().split("T")[0],
    notes: offering?.notes || "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset form when offering changes
    setFormData({
      amount: offering?.amount || "",
      date: offering?.date || new Date().toISOString().split("T")[0],
      notes: offering?.notes || "",
    });
  }, [offering]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        member_id: null,
        amount: Number(formData.amount),
        date: formData.date,
        offering_type: "general",
        notes: formData.notes || null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="amount" className="text-sm sm:text-base">
          Amount <span className="text-destructive">*</span>
        </Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="Enter amount"
          className="text-base sm:text-sm"
        />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="date" className="text-sm sm:text-base">
          Date <span className="text-destructive">*</span>
        </Label>
        <Input
          id="date"
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="text-base sm:text-sm [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer pr-10"
        />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <Label htmlFor="notes" className="text-sm sm:text-base">
          Notes (Optional)
        </Label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          )}
          placeholder="Additional notes..."
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-3 sm:pt-4 gap-2 sm:gap-0">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="w-full sm:w-auto inline-flex h-11 sm:h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2.5 sm:py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto inline-flex h-11 sm:h-10 items-center justify-center rounded-md bg-primary px-4 py-2.5 sm:py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? "Saving..." : offering ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
