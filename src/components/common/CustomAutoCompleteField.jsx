// src/components/common/CustomAutoCompleteField.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";

const MAX_OPTIONS = 50;

export default function CustomAutoCompleteField({
  isLoading,
  loading,
  values = [],
  editingItem = {},
  setEditingItem,
  fieldName,
  placeholder = "اختر قيمة",
  isBig = false,
  inputClassName = "",
  containerClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(
    (editingItem && editingItem[fieldName]) || ""
  );
  const wrapperRef = useRef(null);

  const effectiveLoading = isLoading || loading;

  useEffect(() => {
    setInputValue((editingItem && editingItem[fieldName]) || "");
  }, [editingItem, fieldName]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getLabel = (option) => {
    if (option == null) return "";
    if (typeof option === "string" || typeof option === "number") {
      return String(option);
    }

    if (fieldName === "item_name") {
      const name = option.item_name || option.name || "";
      const barcode = option.item_bar || option.barcode || option.item_barcode;
      return barcode ? `${name} - ${barcode}` : name;
    }

    if (fieldName === "location" || fieldName === "new_location") {
      return option.location || option.name || "";
    }

    if (fieldName === "original_invoice_id") {
      return String(option.id ?? option);
    }

    return (
      option[fieldName] || option.name || option.label || option.title || ""
    );
  };

  const getStoredValue = (option) => {
    if (option == null) return "";

    if (typeof option === "string" || typeof option === "number") {
      return String(option);
    }

    if (fieldName === "item_name") {
      return option.item_name || option.name || "";
    }

    if (fieldName === "location" || fieldName === "new_location") {
      return option.location || option.name || "";
    }

    if (fieldName === "original_invoice_id") {
      return option.id ?? option;
    }

    return (
      option[fieldName] || option.name || option.label || option.title || ""
    );
  };

  const normalizedValues = Array.isArray(values) ? values : [];

  const filteredOptions = useMemo(() => {
    if (!normalizedValues.length) return [];

    const search = (inputValue || "").toLowerCase().trim();

    const result = normalizedValues.filter((opt) =>
      getLabel(opt).toLowerCase().includes(search)
    );

    return result.slice(0, MAX_OPTIONS);
  }, [normalizedValues, inputValue]);

  const handleSelect = (option) => {
    const label = getLabel(option);
    const stored = getStoredValue(option);

    setInputValue(label);
    setOpen(false);

    if (typeof setEditingItem === "function") {
      const updated = {
        ...(editingItem || {}),
        [fieldName]: stored,
      };
      setEditingItem(updated, option);
    }
  };

  return (
    <div
      className={`relative w-full text-sm ${containerClassName}`}
      ref={wrapperRef}
    >
      <div className="relative">
        <input
          type="text"
          className={`w-full rounded-md px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isBig ? "text-sm" : "text-xs"
          } ${inputClassName}`}
          placeholder={placeholder}
          value={inputValue}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
          }}
        />

        {effectiveLoading && (
          <div className="absolute inset-y-0 left-2 flex items-center">
            <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && filteredOptions.length > 0 && (
        <div
          className={`absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg ${
            isBig ? "text-sm" : "text-xs"
          }`}
        >
          {filteredOptions.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              className="block w-full px-3 py-1.5 text-right hover:bg-blue-50"
              onClick={() => handleSelect(opt)}
            >
              {getLabel(opt)}
            </button>
          ))}

          {normalizedValues.length > MAX_OPTIONS && (
            <div className="px-3 py-1 text-[11px] text-gray-400 text-center border-t">
              تم عرض أول {MAX_OPTIONS} نتيجة فقط، جرّبي تضييق البحث
            </div>
          )}
        </div>
      )}

      {open && !effectiveLoading && filteredOptions.length === 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-center text-xs text-gray-500 shadow">
          لا توجد نتائج
        </div>
      )}
    </div>
  );
}
