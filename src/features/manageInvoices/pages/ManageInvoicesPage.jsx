// src/features/invoices/pages/ManageInvoicesPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import { useInvoicesList } from "../hooks/useInvoicesList";
import { useInvoiceFilters } from "../hooks/useInvoiceFilters";
import { useInvoiceActions } from "../hooks/useInvoiceActions";

import InvoicesFilterTabs from "../components/InvoicesFilterTabs";
import InvoicesTable from "../components/InvoicesTable";
import InvoiceModal from "../components/InvoiceModal";
import InvoiceDetailsDialog from "../components/InvoiceDetailsDialog";
import InvoicesToolbar from "../components/InvoicesToolbar";

const ManageInvoicesPage = () => {
  const { user, isUserLoading, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const [alert, setAlert] = useState(null);

  // pagination
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);

  // selected invoice & dialogs
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [detailsInvoiceId, setDetailsInvoiceId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // selected rows for bulk actions
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  // === filters ===
  const { filters, selectedFilter, selectedIndex, setSelectedIndex } =
    useInvoiceFilters(user);

  // === invoices list ===
  const {
    invoices,
    totalPages,
    totalItems,
    loading: invoicesLoading,
    refetch,
  } = useInvoicesList({
    selectedFilter,
    page,
    pageSize,
  });

  // === actions hook ===
  const {
    confirmLoadingMap,
    recoverLoadingMap,
    singleDeleteLoading,
    bulkDeleteLoading,
    handleConfirmStatus,
    handleRecoverDeposit,
    handleDeleteOne,
    handleDeleteMany,
    handleAcceptPurchaseRequest,
    handleRejectPurchaseRequest,
  } = useInvoiceActions({
    onRefresh: refetch,
    setAlert,
  });

  const hasAnyPermission =
    user &&
    (user.view_additions ||
      user.view_withdrawals ||
      user.view_deposits ||
      user.view_returns ||
      user.view_damages ||
      user.view_reservations ||
      user.view_purchase_requests ||
      user.view_transfers ||
      user.username === "admin");

  const handleChangeFilter = (index) => {
    setSelectedIndex(index);
    setSelectedRowIds([]);
    setPage(0);
  };

  const openInvoice = useCallback((invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceModalOpen(true);
  }, []);

  const closeInvoiceModal = () => {
    setIsInvoiceModalOpen(false);
    setSelectedInvoice(null);
  };

  const openDetails = (invoice) => {
    setDetailsInvoiceId(invoice.id);
    setIsDetailsOpen(true);
  };

  const closeDetails = () => {
    setIsDetailsOpen(false);
    setDetailsInvoiceId(null);
  };

  const handleToggleSelectRow = (invoiceId) => {
    setSelectedRowIds((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAllRows = (checked) => {
    if (checked) {
      setSelectedRowIds(invoices.map((inv) => inv.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      setSelectedRowIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowIds.length === 0) return;
    const selectedInvoices = invoices.filter((inv) =>
      selectedRowIds.includes(inv.id)
    );
    await handleDeleteMany(selectedInvoices);
    setSelectedRowIds([]);
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <p className="text-lg font-semibold">جارِ تحميل البيانات...</p>
      </div>
    );
  }

  if (!hasAnyPermission) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <h1 className="text-2xl font-bold text-red-600">
          هذه الصفحة غير متاحة لك
        </h1>
      </div>
    );
  }

  return (
    <div className="w-[95%] mx-auto pt-24 pb-6 space-y-4">
<div className="w-full text-center">
  <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
    العمليات
  </h1>
</div>


      {/* Alert */}
      {alert && (
        <div
          className={`border px-4 py-2 rounded-md text-right ${
            alert.type === "success"
              ? "bg-green-50 border-green-400 text-green-700"
              : alert.type === "warning"
                ? "bg-yellow-50 border-yellow-400 text-yellow-700"
                : "bg-red-50 border-red-400 text-red-700"
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="flex-1">{alert.message}</span>
            <button
              onClick={() => setAlert(null)}
              className="ml-4 text-sm underline"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <InvoicesFilterTabs
        filters={filters}
        selectedIndex={selectedIndex}
        onChange={handleChangeFilter}
      />

      {/* Toolbar */}
      <InvoicesToolbar
        selectedCount={selectedRowIds.length}
        onDeleteSelected={handleBulkDelete}
        bulkDeleteLoading={bulkDeleteLoading}
        invoices={invoices}
      />

      {/* Table */}
      <InvoicesTable
        user={user}
        invoices={invoices}
        loading={invoicesLoading}
        selectedRowIds={selectedRowIds}
        onToggleSelectRow={handleToggleSelectRow}
        onSelectAll={handleSelectAllRows}
        onOpenInvoice={openInvoice}
        onShowDetails={openDetails}
        onDeleteOne={handleDeleteOne}
        onRecoverDeposit={handleRecoverDeposit}
        onConfirmStatus={handleConfirmStatus}
        onAcceptPurchaseRequest={handleAcceptPurchaseRequest}
        onRejectPurchaseRequest={handleRejectPurchaseRequest}
        confirmLoadingMap={confirmLoadingMap}
        recoverLoadingMap={recoverLoadingMap}
        singleDeleteLoading={singleDeleteLoading}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            className="px-3 py-1 rounded border text-sm disabled:opacity-50"
          >
            السابق
          </button>
          <span className="text-sm">
            صفحة {page + 1} من {totalPages} (إجمالي {totalItems} فاتورة)
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page + 1 >= totalPages}
            className="px-3 py-1 rounded border text-sm disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      )}

      {/* Invoice Modal */}
      {isInvoiceModalOpen && selectedInvoice && (
        <InvoiceModal
          open={isInvoiceModalOpen}
          onClose={closeInvoiceModal}
          invoice={selectedInvoice}
          user={user}
        />
      )}

      {/* Details dialog */}
      {isDetailsOpen && detailsInvoiceId && (
        <InvoiceDetailsDialog
          open={isDetailsOpen}
          onClose={closeDetails}
          invoiceId={detailsInvoiceId}
          user={user}
        />
      )}
    </div>
  );
};

export default ManageInvoicesPage;
