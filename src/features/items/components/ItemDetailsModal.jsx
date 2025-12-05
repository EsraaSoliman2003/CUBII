// src/features/items/components/ItemDetailsModal.jsx
import React, { useEffect, useState } from "react";

export default function ItemDetailsModal({
  open,
  item,
  canEdit,
  loadingSave = false,
  onClose,
  onSave,
}) {
  const [editing, setEditing] = useState(false);
  const [localItem, setLocalItem] = useState(item || null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setLocalItem(item || null);
      setEditing(false);
      setErrors({});
    }
  }, [open, item]);

  if (!open || !localItem) return null;

  const handleFieldChange = (field, value) => {
    setLocalItem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationChange = (index, field, value) => {
    setLocalItem((prev) => {
      const locations = Array.isArray(prev.locations)
        ? [...prev.locations]
        : [];
      locations[index] = {
        ...locations[index],
        [field]: value,
      };
      return { ...prev, locations };
    });
  };

  const handleAddLocation = () => {
    setLocalItem((prev) => ({
      ...prev,
      locations: [
        ...(Array.isArray(prev.locations) ? prev.locations : []),
        { location: "", quantity: 0 },
      ],
    }));
  };

  const handleRemoveLocation = (index) => {
    if (!editing) return;
    setLocalItem((prev) => {
      const locations = Array.isArray(prev.locations)
        ? [...prev.locations]
        : [];
      locations.splice(index, 1);
      return { ...prev, locations };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!localItem.item_name?.trim()) newErrors.item_name = "الحقل مطلوب";
    if (!localItem.item_bar?.trim()) newErrors.item_bar = "الحقل مطلوب";

    const locErrors = [];
    (localItem.locations || []).forEach((loc, i) => {
      const le = {};
      if (!loc.location?.trim()) le.location = "الموقع مطلوب";
      // 👈 حزفنا شرط الكمية
      if (Object.keys(le).length > 0) {
        locErrors[i] = le;
      }
    });

    if (locErrors.length > 0) newErrors.locations = locErrors;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const cleaned = {
      ...localItem,
      locations: (localItem.locations || []).map((l) => ({
        location: l.location,
        quantity: Number(l.quantity) || 0,
      })),
    };

    onSave(cleaned);
  };

  const locations = Array.isArray(localItem.locations)
    ? localItem.locations
    : [];

  const rental = localItem.rental_warehouse_info || {};

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800">
            تفاصيل المنتج
          </h2>

          {editing ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-3 py-1 rounded-lg border border-slate-300 text-slate-700 text-xs hover:bg-slate-100"
                disabled={loadingSave}
              >
                إلغاء التعديل
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loadingSave}
                className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-60"
              >
                {loadingSave ? "جارٍ الحفظ..." : "حفظ"}
              </button>
            </div>
          ) : canEdit ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="px-3 py-1 rounded-lg border border-blue-500 text-blue-600 text-xs font-semibold hover:bg-blue-50"
            >
              تعديل
            </button>
          ) : null}
        </div>

        {/* Basic info */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 text-xs font-medium text-right text-slate-600">
              اسم المنتج
            </label>
            {editing ? (
              <>
                <input
                  type="text"
                  value={localItem.item_name || ""}
                  onChange={(e) =>
                    handleFieldChange("item_name", e.target.value)
                  }
                  className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.item_name ? "border-red-400" : "border-slate-300"
                  }`}
                />
                {errors.item_name && (
                  <p className="mt-1 text-xs text-red-500 text-right">
                    {errors.item_name}
                  </p>
                )}
              </>
            ) : (
              <div className="px-3 py-2 rounded-lg bg-slate-50 text-sm">
                {localItem.item_name}
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium text-right text-slate-600">
              الباركود
            </label>
            {editing ? (
              <>
                <input
                  type="text"
                  value={localItem.item_bar || ""}
                  onChange={(e) =>
                    handleFieldChange("item_bar", e.target.value)
                  }
                  className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.item_bar ? "border-red-400" : "border-slate-300"
                  }`}
                />
                {errors.item_bar && (
                  <p className="mt-1 text-xs text-red-500 text-right">
                    {errors.item_bar}
                  </p>
                )}
              </>
            ) : (
              <div className="px-3 py-2 rounded-lg bg-slate-50 text-sm">
                {localItem.item_bar}
              </div>
            )}
          </div>
        </div>

        {/* Locations */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-800">
              المواقع و الكميات
            </h3>
            {editing && (
              <button
                type="button"
                onClick={handleAddLocation}
                className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
              >
                إضافة موقع
              </button>
            )}
          </div>

          {locations.length === 0 ? (
            <div className="px-3 py-2 rounded-lg bg-slate-50 text-sm text-slate-500">
              لا توجد مواقع مسجلة لهذا المنتج
            </div>
          ) : (
            <div className="space-y-3">
              {locations.map((loc, index) => {
                const locError = errors.locations?.[index] || {};
                return (
                  <div
                    key={index}
                    className="border rounded-lg p-3 bg-slate-50 relative"
                  >
                    {editing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(index)}
                        className="absolute left-2 top-2 text-xs text-red-600 hover:text-red-700"
                      >
                        حذف
                      </button>
                    )}

                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-xs font-medium text-right text-slate-600">
                          الموقع
                        </label>
                        {editing ? (
                          <>
                            <input
                              type="text"
                              value={loc.location || ""}
                              onChange={(e) =>
                                handleLocationChange(
                                  index,
                                  "location",
                                  e.target.value
                                )
                              }
                              className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                locError.location
                                  ? "border-red-400"
                                  : "border-slate-300"
                              }`}
                            />
                            {locError.location && (
                              <p className="mt-1 text-xs text-red-500 text-right">
                                {locError.location}
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="px-3 py-2 rounded-lg bg-white text-sm">
                            {loc.location}
                          </div>
                        )}
                      </div>

                      {/* داخل map للـ locations في ItemDetailsModal.jsx */}

                      <div>
                        <label className="block mb-1 text-xs font-medium text-right text-slate-600">
                          الكمية
                        </label>
                        <div className="px-3 py-2 rounded-lg bg-white text-sm">
                          {loc.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* rental warehouse info */}
        {(rental.quantity ||
          rental.reserved_quantity ||
          rental.available_quantity) && (
          <div className="mb-4 border rounded-lg p-3 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              مخزن الحجز
            </h3>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-xs text-slate-500 mb-1">
                  إجمالي الكمية في الحجز
                </div>
                <div className="font-semibold text-slate-800">
                  {rental.quantity ?? 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">كمية محجوزة</div>
                <div className="font-semibold text-slate-800">
                  {rental.reserved_quantity ?? 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">كمية متاحة</div>
                <div className="font-semibold text-slate-800">
                  {rental.available_quantity ?? 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* footer */}
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-semibold hover:bg-slate-800"
            disabled={loadingSave}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
