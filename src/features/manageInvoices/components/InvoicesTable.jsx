import React from "react";
import InvoiceActionsCell from "./InvoiceActionsCell";
import InvoiceStatusCell from "./InvoiceStatusCell";

const InvoicesTable = ({
  user,
  invoices,
  loading,
  selectedRowIds,
  onToggleSelectRow,
  onSelectAll,
  onOpenInvoice,
  onShowDetails,
  onDeleteOne,
  onRecoverDeposit,
  onConfirmStatus,
  onAcceptPurchaseRequest,
  onRejectPurchaseRequest,
  confirmLoadingMap,
  recoverLoadingMap,
  singleDeleteLoading,
}) => {
  const allChecked =
    invoices.length > 0 &&
    invoices.every((inv) => selectedRowIds.includes(inv.id));

  return (
    <div className="mt-4 border border-slate-200 rounded-lg overflow-x-auto">
      <table className="min-w-full text-sm text-right">
        <thead className="bg-slate-100 text-xs font-semibold text-slate-700">
          <tr>
            <th className="px-2 py-2 border-b">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
            <th className="px-2 py-2 border-b">#</th>
            <th className="px-2 py-2 border-b">فتح / أكشنات</th>
            <th className="px-2 py-2 border-b">حالة العملية</th>
            <th className="px-2 py-2 border-b">أسماء العناصر</th>
            <th className="px-2 py-2 border-b">الميكانيزم</th>
            <th className="px-2 py-2 border-b">الماكينة</th>
            <th className="px-2 py-2 border-b">اسم الموظف</th>
            <th className="px-2 py-2 border-b">عامل المخازن</th>
            <th className="px-2 py-2 border-b">المراجع</th>
            <th className="px-2 py-2 border-b">اسم العميل</th>
            <th className="px-2 py-2 border-b">وقت الإصدار</th>
            <th className="px-2 py-2 border-b">تاريخ الإصدار</th>
            <th className="px-2 py-2 border-b">نوع العملية</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={14} className="px-4 py-6 text-center text-slate-500">
                جاري تحميل الفواتير...
              </td>
            </tr>
          )}

          {!loading && invoices.length === 0 && (
            <tr>
              <td colSpan={14} className="px-4 py-6 text-center text-slate-500">
                لا توجد فواتير لعرضها
              </td>
            </tr>
          )}

          {!loading &&
            invoices.map((invoice) => {
              const isSelected = selectedRowIds.includes(invoice.id);
              const confirmLoading = Boolean(confirmLoadingMap[invoice.id]);
              const recoverLoading = Boolean(recoverLoadingMap[invoice.id]);

              return (
                <tr
                  key={invoice.id}
                  className="odd:bg-white even:bg-slate-50 hover:bg-slate-100 transition"
                >
                  <td className="px-2 py-2 border-b align-middle">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectRow(invoice.id)}
                    />
                  </td>
                  <td className="px-2 py-2 border-b align-middle">
                    {invoice.id}
                  </td>
                  <td className="px-2 py-2 border-b align-middle">
                    <InvoiceActionsCell
                      invoice={invoice}
                      user={user}
                      onOpenInvoice={onOpenInvoice}
                      onDeleteOne={onDeleteOne}
                      onShowDetails={onShowDetails}
                      onRecoverDeposit={onRecoverDeposit}
                      recoverLoading={recoverLoading}
                      singleDeleteLoading={singleDeleteLoading}
                    />
                  </td>
                  <td className="px-2 py-2 border-b align-middle">
                    <InvoiceStatusCell
                      invoice={invoice}
                      user={user}
                      onConfirmStatus={onConfirmStatus}
                      onAcceptPurchaseRequest={onAcceptPurchaseRequest}
                      onRejectPurchaseRequest={onRejectPurchaseRequest}
                      confirmLoading={confirmLoading}
                    />
                  </td>
                  <td className="px-2 py-2 border-b align-middle max-w-xs truncate">
                    {invoice.itemsNames}
                  </td>
                  <td className="px-2 py-2 border-b align-middle">
                    {invoice.mechanism_name}
                  </td>
                  <td className="px-2 py-2 border-b align-middle">
                    {invoice.machine_name}
                  </td>
                  <td className="px-2 py-2 border-b align-middle">
                    {invoice.employee_name}
                  </td>
                  <td className="px-2 py-2 border-b align-middle">
                    {invoice.warehouse_manager}
                  </td>
                  <td className="px-2 py-2 border-b align-middle">
                    {invoice.accreditation_manager}
                  </td>
                  <td className="px-2 py-2 border-b align-middle">
                    {invoice.client_name}
                  </td>
                  <td className="px-2 py-2 border-b align-middle">
                    {invoice.time}
                  </td>
                  <td className="px-2 py-2 border-b align-middle">
                    {invoice.date}
                  </td>
                  <td className="px-2 py-2 border-b align-middle">
                    {invoice.type}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default InvoicesTable;
