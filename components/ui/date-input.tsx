"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

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

    // Convert YYYY-MM-DD (from props) to MM/DD/YYYY (for display)
    const convertToDisplay = (value: string | undefined): string => {
      if (!value) return "";
      // Check if it's already in YYYY-MM-DD format
      const yyyymmddMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (yyyymmddMatch) {
        const [, year, month, day] = yyyymmddMatch;
        return `${month}/${day}/${year}`;
      }
      // If it's already in MM/DD/YYYY format, return as-is
      return value;
    };

    const [displayValue, setDisplayValue] = React.useState(() =>
      convertToDisplay(
        typeof props.value === "string"
          ? props.value
          : props.value !== undefined && props.value !== null
            ? String(props.value)
            : undefined
      )
    );
    const [isEmpty, setIsEmpty] = React.useState(!props.value);

    // Combine refs
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      // Validate and format date on blur
      let value = e.target.value.trim();
      if (value) {
        // Try to parse the date - handle both MM/DD/YYYY and YYYY-MM-DD formats
        let date: Date | null = null;

        // Check if it's already in MM/DD/YYYY format
        const mmddyyyyMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (mmddyyyyMatch) {
          const [, month, day, year] = mmddyyyyMatch;
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // Try parsing as-is (might be YYYY-MM-DD or other format)
          date = new Date(value);
        }

        if (date && !isNaN(date.getTime())) {
          // Format as MM/DD/YYYY
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const year = date.getFullYear();
          const formatted = `${month}/${day}/${year}`;

          if (formatted !== value) {
            // Update the input value if it was reformatted
            e.target.value = formatted;
            // Convert to YYYY-MM-DD for the onChange event (backend format)
            const backendFormat = `${year}-${month}-${day}`;
            // Trigger onChange with YYYY-MM-DD format (for backend compatibility)
            const syntheticEvent = {
              ...e,
              target: { ...e.target, value: backendFormat },
            } as React.ChangeEvent<HTMLInputElement>;
            props.onChange?.(syntheticEvent);
          }
        }
      }
      props.onBlur?.(e);
    };

    const formatDateInput = (inputValue: string): string => {
      // Extract only digits from the input (remove all non-digits)
      const digitsOnly = inputValue.replace(/\D/g, "");

      // Limit to 8 digits (MMDDYYYY)
      const limitedDigits = digitsOnly.slice(0, 8);

      // Format with slashes: MM/DD/YYYY
      // Add separators immediately as user types
      let formatted = "";
      if (limitedDigits.length > 0) {
        if (limitedDigits.length <= 2) {
          // Month - add separator after month (e.g., "1" -> "1/", "12" -> "12/")
          formatted = `${limitedDigits}/`;
        } else if (limitedDigits.length <= 4) {
          // Month + day - add separator after day (e.g., "123" -> "12/3/", "1234" -> "12/34/")
          formatted = `${limitedDigits.slice(0, 2)}/${limitedDigits.slice(2)}/`;
        } else {
          // Month + day + year (e.g., "12345" -> "12/34/5", "12345678" -> "12/34/5678")
          formatted = `${limitedDigits.slice(0, 2)}/${limitedDigits.slice(2, 4)}/${limitedDigits.slice(4)}`;
        }
      }
      return formatted;
    };

    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const inputValue = input.value;

      // Extract digits to count them for cursor positioning
      const digitsOnly = inputValue.replace(/\D/g, "");
      const digitCount = digitsOnly.length;

      // Format the input with separators
      const formatted = formatDateInput(inputValue);

      // Update state immediately so React re-renders with formatted value
      setDisplayValue(formatted);
      setIsEmpty(!formatted);

      // Also directly update the input value to ensure it shows immediately
      // This is needed because React's controlled input might lag
      if (input.value !== formatted) {
        input.value = formatted;
      }

      // Convert to YYYY-MM-DD for onChange (backend format) only if complete
      let backendValue = "";
      if (formatted.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [month, day, year] = formatted.split("/");
        backendValue = `${year}-${month}-${day}`;
      }

      // Trigger onChange with backend format
      const syntheticEvent = {
        ...e,
        target: { ...input, value: backendValue },
      } as React.ChangeEvent<HTMLInputElement>;
      props.onChange?.(syntheticEvent);

      // Set cursor position after the last digit, accounting for separators
      setTimeout(() => {
        if (inputRef.current) {
          let cursorPos = formatted.length;

          // Adjust cursor position based on where we are in the format
          if (digitCount <= 2) {
            // After month, position after separator
            cursorPos = digitCount + 1; // e.g., "1/" -> position 2, "12/" -> position 3
          } else if (digitCount <= 4) {
            // After day, position after separator
            cursorPos = digitCount + 2; // Account for month separator + day separator
          } else {
            // In year section, position at end
            cursorPos = formatted.length;
          }

          // Ensure cursor doesn't go beyond the formatted length
          cursorPos = Math.min(cursorPos, formatted.length);
          inputRef.current.setSelectionRange(cursorPos, cursorPos);
        }
      }, 0);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Also handle onChange for compatibility
      handleInput(e as any);
    };

    // Generate mask overlay text - shows format with separators
    const getMaskText = (): string => {
      // Always show the format structure: MM/DD/YYYY
      return "MM/DD/YYYY";
    };

    // Update display value when value prop changes externally (but not while focused or typing)
    React.useEffect(() => {
      if (!isFocused && props.value !== undefined) {
        const valueAsString =
          typeof props.value === "string"
            ? props.value
            : props.value !== undefined && props.value !== null
              ? String(props.value)
              : undefined;
        const converted = convertToDisplay(valueAsString);
        // Only update if the converted value is different from current display
        if (converted !== displayValue) {
          setDisplayValue(converted);
          setIsEmpty(!props.value);
        }
      }
    }, [props.value, isFocused, displayValue]);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {/* Mask overlay - shows format structure with separators when empty */}
          {isEmpty && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-base md:text-sm select-none">
              <span className="text-gray-300">MM</span>
              <span className="text-gray-500">/</span>
              <span className="text-gray-300">DD</span>
              <span className="text-gray-500">/</span>
              <span className="text-gray-300">YYYY</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            placeholder=""
            maxLength={10}
            value={displayValue || ""}
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
              // Prevent zoom on iOS when focusing (16px minimum)
              fontSize: "16px",
              // Better touch response
              touchAction: "manipulation",
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onInput={handleInput}
            onChange={handleChange}
            onKeyDown={(e) => {
              // Allow backspace, delete, arrow keys, tab, etc.
              if (
                e.key === "Backspace" ||
                e.key === "Delete" ||
                e.key.startsWith("Arrow") ||
                e.key === "Tab" ||
                e.key === "Enter" ||
                (e.ctrlKey &&
                  (e.key === "a" ||
                    e.key === "c" ||
                    e.key === "v" ||
                    e.key === "x"))
              ) {
                return; // Allow these keys
              }
              // Prevent non-numeric keys
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

DateInput.displayName = "DateInput";

export { DateInput };
