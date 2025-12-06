// src/features/invoices/pages/ViewInvoicePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInvoice } from "../../../api/modules/invoicesApi";
import InvoiceLayout from "../components/InvoiceLayout";

export default function ViewInvoicePage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    getInvoice(id)
      .then((res) => {
        if (!mounted) return;

        const data = res.data; // ← التعديل المهم هنا فقط

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

        setInvoice({
          ...data,
          date: datePart,
          time: timePart,
        });
      })
      .catch((err) => console.error("getInvoice error", err))
      .finally(() => mounted && setIsLoading(false));

    return () => {
      mounted = false;
    };
  }, [id]);

  if (isLoading || !invoice) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-[90%] mx-auto mt-10 mb-10" dir="rtl">
      <InvoiceLayout
        selectedInvoice={invoice}
        isEditing={false}
        editingInvoice={invoice}
        setEditingInvoice={() => {}}
        selectedNowType={{ type: invoice.type }}
        addRow={() => {}}
        deleteRow={() => {}}
        isPurchasesType={invoice.type === "اضافه"}
        showCommentField
        isCreate={false}
      />
    </div>
  );
}
