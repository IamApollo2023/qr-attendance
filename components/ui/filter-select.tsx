import * as React from "react";
import { cn } from "@/lib/utils";

export interface FilterSelectOption {
  label: string;
  value: string;
}

interface FilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: FilterSelectOption[];
}

export const FilterSelect = React.forwardRef<
  HTMLSelectElement,
  FilterSelectProps
>(({ className, options, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "px-2 md:px-3 py-1 md:py-2 h-7 md:h-9 text-xs md:text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        className
      )}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
});

FilterSelect.displayName = "FilterSelect";
