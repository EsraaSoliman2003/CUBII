// src/features/manageInvoices/components/InvoiceModal.jsx
import React, { useEffect, useState } from "react";
import {
  getInvoice,
  updateInvoice as apiUpdateInvoice,
  returnWarrantyInvoicePartially,
} from "../../../api/modules/invoicesApi";
import InvoiceLayout from "../../invoices/components/InvoiceLayout";
import SnackBar from "../../../components/common/SnackBar";

export default function InvoiceModal({ open, onClose, invoice, user }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });

  // 1) تحميل الفاتورة
  useEffect(() => {
    if (!open || !invoice?.id) return;

    let mounted = true;

    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const res = await getInvoice(invoice.id);
        if (!mounted) return;

        const data = res.data;

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

        const transformed = {
          ...data,
          date: datePart,
          time: timePart,
        };

        setSelectedInvoice(transformed);
        setEditingInvoice(transformed);
        setIsEditing(false);
      } catch (err) {
        console.error("getInvoice error in InvoiceModal", err);
        setSnackbar({
          open: true,
          message: "فشل في تحميل بيانات الفاتورة",
          type: "error",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchInvoice();

    return () => {
      mounted = false;
    };
  }, [open, invoice?.id]);

  // 2) لو الفاتورة أمانات: تحميل حالة الاسترداد الجزئي وتحديث البنود
  useEffect(() => {
    if (!selectedInvoice || selectedInvoice.type !== "أمانات") return;

    let mounted = true;

    const fetchReturnStatus = async () => {
      try {
        const res = await returnWarrantyInvoicePartially({
          id: selectedInvoice.id,
        });
        const status = res.data;
        if (!mounted || !status?.items) return;

        // تحديث selectedInvoice
        setSelectedInvoice((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: (prev.items || []).map((it) => {
              const match = status.items.find(
                (r) =>
                  r.item_name === it.item_name &&
                  r.item_bar === it.barcode &&
                  r.location === it.location
              );

              if (!match) {
                return {
                  ...it,
                  total_returned: it.total_returned || 0,
                  is_fully_returned: it.is_fully_returned || false,
                };
              }

              return {
                ...it,
                total_returned:
                  typeof match.total_returned === "number"
                    ? match.total_returned
                    : it.total_returned || 0,
                is_fully_returned:
                  typeof match.is_fully_returned === "boolean"
                    ? match.is_fully_returned
                    : it.is_fully_returned || false,
              };
            }),
          };
        });

        // تحديث editingInvoice عشان لو في وضع تعديل بردو يشوف نفس القيم
        setEditingInvoice((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: (prev.items || []).map((it) => {
              const match = status.items.find(
                (r) =>
                  r.item_name === it.item_name &&
                  r.item_bar === it.barcode &&
                  r.location === it.location
              );

              if (!match) {
                return {
                  ...it,
                  total_returned: it.total_returned || 0,
                  is_fully_returned: it.is_fully_returned || false,
                };
              }

              return {
                ...it,
                total_returned:
                  typeof match.total_returned === "number"
                    ? match.total_returned
                    : it.total_returned || 0,
                is_fully_returned:
                  typeof match.is_fully_returned === "boolean"
                    ? match.is_fully_returned
                    : it.is_fully_returned || false,
              };
            }),
          };
        });
      } catch (err) {
        console.error(
          "returnWarrantyInvoicePartially error in InvoiceModal",
          err
        );
        // مش لازم نطلع SnackBar هنا، يكفي اللوج
      }
    };

    fetchReturnStatus();

    return () => {
      mounted = false;
    };
  }, [selectedInvoice?.id, selectedInvoice?.type]);

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const handleStartEdit = () => {
    if (!selectedInvoice) return;
    setEditingInvoice(selectedInvoice);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingInvoice) return;

    setSaving(true);
    try {
      await apiUpdateInvoice({
        id: editingInvoice.id,
        ...editingInvoice,
      });

      setSelectedInvoice(editingInvoice);
      setIsEditing(false);

      setSnackbar({
        open: true,
        message: "تم حفظ التعديلات بنجاح",
        type: "success",
      });
    } catch (err) {
      console.error("updateInvoice error in InvoiceModal", err);
      setSnackbar({
        open: true,
        message: "حدث خطأ أثناء حفظ التعديلات",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const addRow = () => {
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
          supplier_name: "",
          new_location: "",
        },
      ],
    }));
  };

  const deleteRow = (index) => {
    setEditingInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  if (!open || !invoice) {
    return (
      <>
        <SnackBar
          open={snackbar.open}
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        />
      </>
    );
  }

  const isDeposit = selectedInvoice?.type === "أمانات";
  const canViewPrices = user?.view_prices || user?.username === "admin";

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        onClick={handleClose}
      >
        <div
          className="bg-white rounded-lg shadow-xl w-[95%] max-w-5xl max-h-[90vh] overflow-y-auto p-4"
          dir="rtl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* هيدر المودال */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-800">
              الفاتورة رقم {invoice.id}
            </h2>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-3 py-1 rounded-md text-sm bg-blue-600 text-white disabled:opacity-50"
                  >
                    {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingInvoice(selectedInvoice);
                      setIsEditing(false);
                    }}
                    className="px-3 py-1 rounded-md text-sm bg-slate-200 text-slate-800"
                  >
                    إلغاء التعديل
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  disabled={loading || !selectedInvoice}
                  className="px-3 py-1 rounded-md text-sm bg-blue-600 text-white disabled:opacity-50"
                >
                  تعديل
                </button>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1 rounded-md text-sm bg-slate-700 text-white"
              >
                إغلاق
              </button>
            </div>
          </div>

          {/* محتوى الفاتورة */}
          {loading || !selectedInvoice || !editingInvoice ? (
            <div className="w-full py-10 flex items-center justify-center">
              <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <InvoiceLayout
              selectedInvoice={selectedInvoice}
              isEditing={isEditing}
              editingInvoice={editingInvoice}
              setEditingInvoice={setEditingInvoice}
              selectedNowType={{ type: selectedInvoice.type }}
              addRow={addRow}
              deleteRow={deleteRow}
              isPurchasesType={selectedInvoice.type === "اضافه"}
              showCommentField
              isCreate={false}
              canEsterdad={isDeposit}
              setSelectedInvoice={setSelectedInvoice}
              canViewPrices={canViewPrices}
            />
          )}
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
