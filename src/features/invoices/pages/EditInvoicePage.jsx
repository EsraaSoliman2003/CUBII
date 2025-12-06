// src/features/invoices/pages/EditInvoicePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getInvoice,
  updateInvoice as apiUpdateInvoice,
} from "../../../api/modules/invoicesApi";
import InvoiceLayout from "../components/InvoiceLayout";
import SnackBar from "../../../components/common/SnackBar";

export default function EditInvoicePage() {
  const { id } = useParams();

  const [editingInvoice, setEditingInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    getInvoice(id)
      .then((res) => {
        if (!mounted) return;

        const data = res.data; // 👈 ده التعديل المهم

        const datePart = data.created_at
          ? data.created_at.split(" ")[0]
          : data.date || "";
        const timePart = data.created_at
          ? new Date(
              `1970-01-01 ${data.created_at.split(" ")[1]}`
            ).toLocaleTimeString("en-US", {
              hour12: true,
              hour: "numeric",
              minute: "2-digit",
            })
          : data.time || "";

        setEditingInvoice({
          ...data,
          date: datePart,
          time: timePart,
        });
      })
      .catch((err) => {
        console.error("getInvoice error", err);
      })
      .finally(() => mounted && setIsLoading(false));

    return () => {
      mounted = false;
    };
  }, [id]);

  if (isLoading || !editingInvoice) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiUpdateInvoice({ id, ...editingInvoice });
      // const data = res.data; // لو احتجتي تستخدمى الداتا بعدين

      setSnackbar({
        open: true,
        message: "تم تحديث الفاتورة بنجاح",
        type: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "فشل في تحديث الفاتورة",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-[90%] mx-auto mt-10 mb-10" dir="rtl">
      <InvoiceLayout
        selectedInvoice={editingInvoice}
        isEditing
        editingInvoice={editingInvoice}
        setEditingInvoice={setEditingInvoice}
        selectedNowType={{ type: editingInvoice.type }}
        addRow={() =>
          setEditingInvoice((prev) => ({
            ...prev,
            items: [
              ...prev.items,
              {
                item_name: "",
                barcode: "",
                quantity: 0,
                location: "",
                unit_price: 0,
                total_price: 0,
                description: "",
              },
            ],
          }))
        }
        deleteRow={(index) =>
          setEditingInvoice((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
          }))
        }
        isPurchasesType={editingInvoice.type === "اضافه"}
        showCommentField
        isCreate={false}
      />

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
        >
          {isSaving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>

      <SnackBar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
      />
    </div>
  );
}
