"use client";

import { Edit, Trash2, MoreVertical } from "lucide-react";
import type { Pledge } from "../types/finance.types";
import type { PaginationInfo } from "../types/finance.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PledgeTableProps {
  pledges: Pledge[];
  pagination: PaginationInfo | null;
  loading: boolean;
  onEdit: (pledge: Pledge) => void;
  onDelete: (pledge: Pledge) => void;
  onPageChange: (page: number) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function PledgeTable({
  pledges,
  pagination,
  loading,
  onEdit,
  onDelete,
  onPageChange,
}: PledgeTableProps) {
  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Loading...</div>
    );
  }

  if (pledges.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No pledges found.
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {pledges.map((pledge) => (
          <div
            key={pledge.id}
            className="border rounded-lg p-3 bg-white space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {pledge.member
                    ? `${pledge.member.member_id} - ${pledge.member.first_name} ${pledge.member.last_name}`
                    : "Anonymous"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(pledge.date)}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="text-sm font-semibold">
                  {formatCurrency(pledge.amount)}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(pledge)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(pledge)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {pledge.notes && (
              <div className="text-xs text-muted-foreground pt-1 border-t">
                {pledge.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Member</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pledges.map((pledge) => (
              <TableRow key={pledge.id}>
                <TableCell className="font-medium">
                  {formatDate(pledge.date)}
                </TableCell>
                <TableCell>
                  {pledge.member
                    ? `${pledge.member.member_id} - ${pledge.member.first_name} ${pledge.member.last_name}`
                    : "Anonymous"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(pledge.amount)}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {pledge.notes || "—"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(pledge)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(pledge)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} (
            {pagination.total} total)
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className="flex-1 sm:flex-initial text-xs sm:text-sm"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="flex-1 sm:flex-initial text-xs sm:text-sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
