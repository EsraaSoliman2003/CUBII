import React from "react";

const InvoiceActionsCell = ({
  invoice,
  user,
  onOpenInvoice,
  onDeleteOne,
  onShowDetails,
  onRecoverDeposit,
  recoverLoading,
  singleDeleteLoading,
}) => {
  const isAdmin = user?.username === "admin";
  const canDelete = user?.can_delete || isAdmin;
  const canViewPrices = user?.view_prices || isAdmin;
  const canRecoverDeposits = user?.can_recover_deposits || isAdmin;

  const isDeposit = invoice.type === "أمانات";

  const showDetailsAllowed =
    canViewPrices &&
    invoice.type !== "اضافه" &&
    invoice.type !== "طلب شراء" &&
    invoice.type !== "تحويل";

  const isReturned =
    invoice.status === "تم الاسترداد" || invoice.status === "استرداد جزئي";

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onOpenInvoice(invoice)}
        className="px-2 py-1 text-xs rounded border border-slate-300 bg-white hover:bg-slate-100"
      >
        فتح
      </button>

      {canDelete && (
        <button
          type="button"
          onClick={() => onDeleteOne(invoice)}
          disabled={singleDeleteLoading}
          className="px-2 py-1 text-xs rounded border border-red-500 text-red-600 bg-white hover:bg-red-50 disabled:opacity-60"
        >
          {singleDeleteLoading ? "..." : "حذف"}
        </button>
      )}

      {showDetailsAllowed && (
        <button
          type="button"
          onClick={() => onShowDetails(invoice)}
          className="px-2 py-1 text-xs rounded border border-amber-500 text-amber-600 bg-white hover:bg-amber-50"
        >
          تفاصيل سعرية
        </button>
      )}

      {isDeposit && (
        <div className="text-xs">
          {isReturned ? (
            <span className="text-green-600 font-semibold">
              {invoice.status}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onRecoverDeposit(invoice)}
              disabled={recoverLoading || !canRecoverDeposits}
              className="px-2 py-1 text-xs rounded border border-cyan-600 text-cyan-700 bg-white hover:bg-cyan-50 disabled:opacity-60"
            >
              {recoverLoading ? "..." : "استرداد"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceActionsCell;
