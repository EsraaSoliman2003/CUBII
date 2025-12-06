// src/components/SnackBar.jsx
import React, { useEffect } from "react";

const COLORS = {
  success: "bg-green-600",
  error: "bg-red-600",
  warning: "bg-yellow-500",
  info: "bg-blue-600",
};

export default function SnackBar({
  open,
  message,
  type = "info",
  onClose,
  autoHideDuration = 3000,
}) {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => {
      onClose && onClose();
    }, autoHideDuration);
    return () => clearTimeout(id);
  }, [open, autoHideDuration, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center">
      <div
        className={`max-w-md rounded-lg px-4 py-2 text-sm text-white shadow-lg ${COLORS[type] || COLORS.info}`}
      >
        <div className="flex items-center justify-between gap-3">
          <span>{message}</span>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 text-xs font-bold opacity-80 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
