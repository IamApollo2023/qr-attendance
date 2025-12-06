"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

export interface DateInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  error?: string;
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, label, error, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = React.useState(false);

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={inputRef}
            type="date"
            inputMode="none"
            className={cn(
              // Base styles - mobile first
              "w-full px-3 py-3 text-base", // Larger touch target on mobile
              "border border-gray-300 rounded-lg",
              "bg-white",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "disabled:cursor-not-allowed disabled:opacity-50",
              // Mobile optimizations
              "min-h-[44px]", // iOS minimum touch target (WCAG 2.1 AA)
              // Desktop styles
              "md:py-2 md:text-sm",
              // Error state
              error && "border-red-500 focus:ring-red-500 focus:border-red-500",
              className
            )}
            style={{
              // Ensure proper mobile behavior
              WebkitAppearance: "none",
              MozAppearance: "textfield",
              // Prevent zoom on iOS when focusing (16px minimum)
              fontSize: "16px",
              // Better touch response
              touchAction: "manipulation",
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {/* Calendar icon indicator - only show when not focused and has value */}
          {!isFocused && props.value && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Calendar className="w-4 h-4 text-gray-400 md:w-3.5 md:h-3.5" />
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

DateInput.displayName = "DateInput";

export { DateInput };
