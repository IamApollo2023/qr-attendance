"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import type { Member } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { PrintQRModal } from "./PrintQRModal";
import { Printer, Search } from "lucide-react";

type DialogMode = "initial" | "print-all" | "print-specific";

interface PrintDialogProps {
  isOpen: boolean;
  allMembers: Member[]; // Current paginated members (for display count)
  dateFilters?: {
    dateAddedFrom?: string;
    dateAddedTo?: string;
  };
  onClose: () => void;
}

export function PrintDialog({
  isOpen,
  allMembers,
  dateFilters,
  onClose,
}: PrintDialogProps) {
  const [mode, setMode] = useState<DialogMode>("initial");
  const [searchInput, setSearchInput] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(
    new Set()
  );
  const [membersToPrint, setMembersToPrint] = useState<Member[]>([]);
  const [shouldTriggerPrint, setShouldTriggerPrint] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isLoadingAllMembers, setIsLoadingAllMembers] = useState(false);
  const [allMembersForPrint, setAllMembersForPrint] = useState<Member[]>([]);
  const printTriggeredRef = useRef(false);

  // Fetch all members for printing (respecting date filters)
  const fetchAllMembersForPrint = useCallback(async () => {
    setIsLoadingAllMembers(true);
    try {
      const { memberRepository } =
        await import("@/lib/repositories/memberRepository");
      const allMembersData = await memberRepository.getAll({
        dateAddedFrom: dateFilters?.dateAddedFrom,
        dateAddedTo: dateFilters?.dateAddedTo,
      });
      setAllMembersForPrint(allMembersData);
      return allMembersData;
    } catch (error) {
      console.error("Failed to fetch all members for printing:", error);
      return [];
    } finally {
      setIsLoadingAllMembers(false);
    }
  }, [dateFilters]);

  // Load all members when dialog opens in print-specific mode
  useEffect(() => {
    if (
      isOpen &&
      mode === "print-specific" &&
      allMembersForPrint.length === 0
    ) {
      fetchAllMembersForPrint();
    }
  }, [isOpen, mode, allMembersForPrint.length, fetchAllMembersForPrint]);

  // Filter members based on search input (use allMembersForPrint when available)
  const searchableMembers =
    allMembersForPrint.length > 0 ? allMembersForPrint : allMembers;
  const filteredMembers = useMemo(() => {
    if (!searchInput.trim()) {
      return [];
    }
    const searchLower = searchInput.toLowerCase();
    return searchableMembers.filter((member) => {
      const searchTarget =
        `${member.first_name} ${member.middle_name || ""} ${member.last_name} ${member.member_id} ${member.barangay_name || ""} ${member.city_municipality_name || ""}`.toLowerCase();
      return searchTarget.includes(searchLower);
    });
  }, [searchableMembers, searchInput]);

  // Get selected members
  const selectedMembers = useMemo(() => {
    return searchableMembers.filter((member) =>
      selectedMemberIds.has(member.member_id)
    );
  }, [searchableMembers, selectedMemberIds]);

  // Handle print all
  const handlePrintAll = async () => {
    const allMembersData = await fetchAllMembersForPrint();
    setMembersToPrint(allMembersData);
    setShouldTriggerPrint(true);
  };

  // Handle print specific
  const handlePrintSpecific = () => {
    if (selectedMembers.length === 0) return;
    setMembersToPrint(selectedMembers);
    setShouldTriggerPrint(true);
  };

  // Toggle member selection
  const toggleMemberSelection = (memberId: string) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  // Toggle select all visible
  const toggleSelectAllVisible = () => {
    const visibleIds = filteredMembers.map((m) => m.member_id);
    const allSelected = visibleIds.every((id) => selectedMemberIds.has(id));

    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // Trigger print when membersToPrint is set
  useEffect(() => {
    if (
      shouldTriggerPrint &&
      membersToPrint.length > 0 &&
      !printTriggeredRef.current
    ) {
      printTriggeredRef.current = true;
      setIsPrinting(true);

      // Close dialog first
      onClose();

      // Wait for dialog to close and PrintQRModal to mount, then trigger print
      // Use multiple delays to ensure DOM is fully updated and component is rendered
      const triggerPrint = (attempts = 0) => {
        const printContent = document.getElementById("print-qr-content");
        if (printContent) {
          // Make sure it's in the DOM and has content
          const hasContent = printContent.children.length > 0;
          const hasSVG = printContent.querySelectorAll("svg").length > 0;

          if (hasContent && hasSVG) {
            // Force a reflow to ensure styles are applied
            printContent.offsetHeight;
            // Log for debugging
            console.log("Print content ready, triggering print", {
              children: printContent.children.length,
              svgs: printContent.querySelectorAll("svg").length,
            });
            // Small delay to ensure styles are applied
            setTimeout(() => {
              window.print();
            }, 200);
          } else if (attempts < 30) {
            // If no content yet, wait a bit more (max 30 attempts = 1.5 seconds)
            setTimeout(() => triggerPrint(attempts + 1), 50);
          } else {
            console.error(
              "PrintQRModal content not ready after multiple attempts",
              {
                hasContent,
                hasSVG,
                children: printContent.children.length,
              }
            );
            // Try printing anyway
            window.print();
          }
        } else if (attempts < 30) {
          // If element not found, try again (max 30 attempts = 1.5 seconds)
          setTimeout(() => triggerPrint(attempts + 1), 50);
        } else {
          console.error(
            "PrintQRModal element not found after multiple attempts"
          );
        }
      };

      // Give React time to render the component and portal (longer delay for mobile)
      setTimeout(() => triggerPrint(), 800);

      return () => {
        // Cleanup if component unmounts before print
      };
    }
  }, [shouldTriggerPrint, membersToPrint, onClose]);

  // Handle print dialog close event to reset state
  useEffect(() => {
    const handleAfterPrint = () => {
      if (printTriggeredRef.current && isPrinting) {
        // Small delay before resetting to ensure print dialog is fully closed
        setTimeout(() => {
          setMode("initial");
          setSearchInput("");
          setSelectedMemberIds(new Set());
          setMembersToPrint([]);
          setShouldTriggerPrint(false);
          setIsPrinting(false);
          printTriggeredRef.current = false;
        }, 300);
      }
    };

    // Listen for afterprint event
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [isPrinting]);

  // Reset state when dialog closes (only if not printing)
  const handleClose = () => {
    if (!isPrinting) {
      setMode("initial");
      setSearchInput("");
      setSelectedMemberIds(new Set());
      setMembersToPrint([]);
      setShouldTriggerPrint(false);
      printTriggeredRef.current = false;
      setIsPrinting(false);
    }
    onClose();
  };

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen && !isPrinting) {
      setMode("initial");
      setSearchInput("");
      setSelectedMemberIds(new Set());
      setMembersToPrint([]);
      setShouldTriggerPrint(false);
      printTriggeredRef.current = false;
      setIsPrinting(false);
      setAllMembersForPrint([]); // Reset cached members
    }
  }, [isOpen, isPrinting]);

  const formatAddress = (member: Member) => {
    const barangay = member.barangay_name || "";
    const city = member.city_municipality_name || "";
    if (!barangay && !city) return "—";
    return `${barangay}${barangay && city ? ", " : ""}${city}`;
  };

  const allVisibleSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((m) => selectedMemberIds.has(m.member_id));

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-2xl max-h-[80dvh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Print QR Codes</DialogTitle>
            <DialogDescription>
              {mode === "initial" &&
                "Choose to print all members or select specific members."}
              {mode === "print-specific" &&
                "Search and select members to print QR codes for."}
            </DialogDescription>
          </DialogHeader>

          {mode === "initial" && (
            <div className="flex flex-col gap-3 mt-4">
              <Button
                onClick={handlePrintAll}
                className="w-full"
                size="lg"
                disabled={isLoadingAllMembers}
              >
                <Printer className="h-4 w-4" />
                {isLoadingAllMembers
                  ? "Loading..."
                  : `Print All${dateFilters?.dateAddedFrom || dateFilters?.dateAddedTo ? " (Filtered)" : ""}`}
              </Button>
              <Button
                onClick={() => setMode("print-specific")}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Search className="h-4 w-4" />
                Print Specific
              </Button>
            </div>
          )}

          {mode === "print-specific" && (
            <div className="flex flex-col flex-1 min-h-0 mt-4 gap-4">
              <div className="flex-shrink-0">
                <SearchInput
                  wrapperClassName="w-full"
                  placeholder="Search members..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  autoFocus
                />
              </div>

              {filteredMembers.length > 0 && (
                <div className="flex-shrink-0 flex items-center gap-2 pb-2 border-b">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={toggleSelectAllVisible}
                  />
                  <span className="text-sm text-muted-foreground">
                    Select all visible ({filteredMembers.length})
                  </span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto min-h-0">
                {filteredMembers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-gray-600 text-sm md:text-base">
                      {searchInput.trim()
                        ? "No members found"
                        : "Start typing to search for members"}
                    </p>
                    {searchInput.trim() && (
                      <p className="text-gray-500 text-xs md:text-sm mt-2">
                        Try a different search term
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredMembers.map((member) => {
                      const isSelected = selectedMemberIds.has(
                        member.member_id
                      );
                      return (
                        <div
                          key={member.id}
                          onClick={() =>
                            toggleMemberSelection(member.member_id)
                          }
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-blue-50 border-blue-200"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                toggleMemberSelection(member.member_id)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-semibold text-xs md:text-sm text-gray-900">
                                  {member.member_id}
                                </span>
                              </div>
                              <p className="text-sm md:text-base font-medium text-gray-900">
                                {member.first_name} {member.middle_name}{" "}
                                {member.last_name}
                              </p>
                              <p className="text-xs md:text-sm text-gray-600 mt-1 truncate">
                                {formatAddress(member)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t gap-3">
                <div className="text-sm text-muted-foreground">
                  {selectedMembers.length > 0
                    ? `${selectedMembers.length} member${selectedMembers.length !== 1 ? "s" : ""} selected`
                    : "No members selected"}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMode("initial");
                      setSearchInput("");
                      setSelectedMemberIds(new Set());
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePrintSpecific}
                    disabled={selectedMembers.length === 0}
                  >
                    <Printer className="h-4 w-4" />
                    Print ({selectedMembers.length})
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PrintQRModal - always render when we have members to print */}
      {membersToPrint.length > 0 && (
        <PrintQRModal membersToPrint={membersToPrint} />
      )}
    </>
  );
}
