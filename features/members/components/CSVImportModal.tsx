"use client";

import { X } from "lucide-react";
import { useRef } from "react";

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CSVImportModal({
  isOpen,
  onClose,
  onFileUpload,
}: CSVImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 md:p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Import CSV</h2>
          <button
            onClick={() => {
              onClose();
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSV File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={onFileUpload}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">CSV Format:</p>
            <p className="text-xs text-blue-700">
              Required columns: first_name, last_name, address, birthday
              (YYYY-MM-DD), gender (male/female)
              <br />
              Optional: member_id (auto-generated if not provided)
            </p>
          </div>
          <button
            onClick={() => {
              onClose();
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}









