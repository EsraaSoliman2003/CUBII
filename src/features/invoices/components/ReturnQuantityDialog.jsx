// src/features/invoices/components/ReturnQuantityDialog.jsx
import React, { useState } from "react";
import {
  returnWarrantyInvoice,
  returnWarrantyInvoicePartially,
} from "../../../api/modules/invoicesApi";
import SnackBar from "../../../components/common/SnackBar";

export default function ReturnQuantityDialog({
  open,
  onClose,
  selectedInvoice,
  selectedItemIndex,
  setSelectedInvoice,
}) {
  const [quantity, setQuantity] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [loading, setLoading] = useState(false);

  if (!open || !selectedInvoice || selectedItemIndex == null) {
    return (
      <SnackBar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
      />
    );
  }

  const item = selectedInvoice.items[selectedItemIndex];

  const handleConfirm = async () => {
    if (!quantity || Number(quantity) <= 0) {
      setSnackbar({
        open: true,
        message: "برجاء إدخال كمية صحيحة",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      await returnWarrantyInvoice({
        id: selectedInvoice.id,
        itemName: item.item_name,
        itemBar: item.barcode,
        location: item.location,
        quantity: Number(quantity),
      });

      const res = await returnWarrantyInvoicePartially({
        id: selectedInvoice.id,
      });
      const updatedStatus = res.data;

      setSelectedInvoice((prev) => ({
        ...prev,
        items: prev.items.map((it, idx) =>
          idx === selectedItemIndex
            ? {
                ...it,
                total_returned:
                  updatedStatus?.items?.find(
                    (r) =>
                      r.item_name === it.item_name &&
                      r.item_bar === it.barcode &&
                      r.location === it.location
                  )?.total_returned ||
                  it.total_returned ||
                  0,
                is_fully_returned:
                  updatedStatus?.items?.find(
                    (r) =>
                      r.item_name === it.item_name &&
                      r.item_bar === it.barcode &&
                      r.location === it.location
                  )?.is_fully_returned || false,
              }
            : it
        ),
      }));

      setSnackbar({
        open: true,
        message: "تم الاسترداد بنجاح",
        type: "success",
      });
      onClose();
    } catch (error) {
      console.log(error);
      setSnackbar({
        open: true,
        message: "حدث خطأ أثناء الاسترداد",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div
          className="bg-white rounded-lg shadow-lg max-w-sm w-full p-4"
          dir="rtl"
        >
          <h2 className="text-base font-semibold text-gray-800 mb-3 text-center">
            كمية الاسترداد
          </h2>

          <input
            type="number"
            min="0"
            className="w-full border border-gray-300 rounded-md px-2 py-2 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50"
            >
              {loading ? "جارٍ الحفظ..." : "تأكيد"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-red-600 text-white text-sm"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>

      <SnackBar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
      />
    </>
  );
}
