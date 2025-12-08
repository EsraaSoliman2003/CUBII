// src/features/invoices/components/InvoiceLayout.jsx
import React from "react";
import InvoiceHeader from "./InvoiceHeader";
import InvoiceMetaInfo from "./InvoiceMetaInfo";
import InvoiceItemsTable from "./InvoiceItemsTable";
import InvoiceMoneySummary from "./InvoiceMoneySummary";
import InvoiceComment from "./InvoiceComment";
import InvoiceParties from "./InvoiceParties";

export default function InvoiceLayout({
  className = "",
  selectedInvoice,
  isEditing,
  editingInvoice,
  setEditingInvoice,
  selectedNowType,
  addRow,
  deleteRow,
  isPurchasesType,
  showCommentField,
  isCreate = false,
  justEditUnitPrice = false,
  canEsterdad = false,
  setSelectedInvoice,
  canViewPrices = false,
}) {
  return (
    <div
      className={`${isCreate ? "p-4 md:p-6" : "p-4"} ${className}`}
      dir="rtl"
    >
      <InvoiceHeader invoice={selectedInvoice} />

      <InvoiceMetaInfo
        selectedInvoice={selectedInvoice}
        editingInvoice={editingInvoice}
        setEditingInvoice={setEditingInvoice}
        isEditing={isEditing}
        selectedNowType={selectedNowType}
        justEditUnitPrice={justEditUnitPrice}
        canEsterdad={canEsterdad}
        canViewPrices={canViewPrices}
      />

      <InvoiceItemsTable
        selectedInvoice={selectedInvoice}
        editingInvoice={editingInvoice}
        setEditingInvoice={setEditingInvoice}
        isEditing={isEditing}
        selectedNowType={selectedNowType}
        addRow={addRow}
        deleteRow={deleteRow}
        isPurchasesType={isPurchasesType}
        isCreate={isCreate}
        justEditUnitPrice={justEditUnitPrice}
        canEsterdad={canEsterdad}
        setSelectedInvoice={setSelectedInvoice}
        canViewPrices={canViewPrices}
      />

      {canViewPrices &&
        (isPurchasesType || selectedInvoice.type === "اضافه") && (
          <InvoiceMoneySummary
            selectedInvoice={selectedInvoice}
            editingInvoice={editingInvoice}
            setEditingInvoice={setEditingInvoice}
            isEditing={isEditing}
          />
        )}

      <InvoiceComment
        selectedInvoice={selectedInvoice}
        editingInvoice={editingInvoice}
        setEditingInvoice={setEditingInvoice}
        isEditing={isEditing}
        isCreate={isCreate}
        showCommentField={showCommentField}
      />

      <InvoiceParties
        invoice={selectedInvoice}
        editingInvoice={editingInvoice}
        isEditing={isEditing}
        setEditingInvoice={setEditingInvoice}
      />
    </div>
  );
}
