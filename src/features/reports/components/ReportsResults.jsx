// src/features/reports/components/ReportsResults.jsx
import React from "react";

const STATUS_EN_TO_AR = {
  draft: { text: "لم تراجع", color: "bg-red-100 text-red-800 border-red-200" },
  accreditation: { text: "لم تؤكد", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  confirmed: { text: "تم", color: "bg-green-100 text-green-800 border-green-200" },
  partially_returned: { text: "استرداد جزئي", color: "bg-blue-100 text-blue-800 border-blue-200" },
  returned: { text: "تم الاسترداد", color: "bg-emerald-100 text-emerald-800 border-emerald-200" }
};

const TYPE_COLORS = {
  "اضافه": "bg-green-50 text-green-700 border-green-200",
  "صرف": "bg-red-50 text-red-700 border-red-200",
  "أمانات": "bg-blue-50 text-blue-700 border-blue-200",
  "مرتجع": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "توالف": "bg-gray-50 text-gray-700 border-gray-200",
  "حجز": "bg-purple-50 text-purple-700 border-purple-200",
  "طلب شراء": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "تحويل": "bg-cyan-50 text-cyan-700 border-cyan-200"
};

export default function ReportsResults({
  reportType,
  results,
  isLoading,
  canViewPrices,
  page,
  totalPages,
  totalItems,
  onPageChange,
  onBackToFilters,
  onOpenInvoice,
  onOpenInvoiceDetails,
  onOpenItemDetails,
}) {
  const handlePrint = () => {
    const isInvoices = reportType === "فواتير";
    const data = results || [];
    if (!data.length) {
      alert("لا توجد بيانات للطباعة");
      return;
    }

    const win = window.open("", "_blank");
    if (!win) return;

    let head = "";
    let body = "";
    let title = isInvoices ? "تقرير الفواتير" : "تقرير المخازن";

    if (isInvoices) {
      head = `
        <tr>
          <th>#</th>
          <th>نوع العملية</th>
          <th>تاريخ الإصدار</th>
          ${canViewPrices ? "<th>الإجمالي</th>" : ""}
          <th>الحالة</th>
          <th>اسم الموظف</th>
          <th>اسم العميل</th>
          <th>المراجع</th>
          <th>عامل المخزن</th>
          <th>الماكينة</th>
          <th>الميكانيزم</th>
          <th>المورد</th>
        </tr>
      `;
      body = data
        .map(
          (inv) => `
          <tr>
            <td>${inv.id ?? "-"}</td>
            <td>${inv.type ?? "-"}</td>
            <td>${inv.created_at ? inv.created_at.split(" ")[0] : "-"}</td>
            ${
              canViewPrices
                ? `<td>${["طلب شراء", "تحويل"].includes(inv.type)
                    ? "-"
                    : inv.total_amount ?? 0}</td>`
                : ""
            }
            <td>${STATUS_EN_TO_AR[inv.status]?.text || inv.status || "-"}</td>
            <td>${inv.employee_name || "-"}</td>
            <td>${inv.client_name || "-"}</td>
            <td>${inv.accreditation_manager || "-"}</td>
            <td>${inv.warehouse_manager || "-"}</td>
            <td>${inv.machine || "-"}</td>
            <td>${inv.mechanism || "-"}</td>
            <td>${inv.supplier || "-"}</td>
          </tr>
        `
        )
        .join("");
    } else {
      head = `
        <tr>
          <th>#</th>
          <th>اسم العنصر</th>
          <th>باركود العنصر</th>
          <th>تاريخ الإنشاء</th>
        </tr>
      `;
      body = data
        .map(
          (item) => `
          <tr>
            <td>${item.id ?? "-"}</td>
            <td>${item.item_name ?? "-"}</td>
            <td>${item.item_bar ?? "-"}</td>
            <td>${item.created_at ? item.created_at.split(" ")[0] : "-"}</td>
          </tr>
        `
        )
        .join("");
    }

    win.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
            h2 { text-align: center; margin-bottom: 20px; color: #1f2937; }
            .print-header { text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #3b82f6; }
            .print-header h1 { color: #1e40af; margin: 0; }
            .print-meta { text-align: center; color: #6b7280; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #d1d5db; }
            th { background: #1f2937; color: white; padding: 12px 8px; font-weight: 600; border: 1px solid #374151; }
            td { padding: 10px 8px; border: 1px solid #d1d5db; text-align: center; }
            tr:nth-child(even) { background: #f9fafb; }
            .status-badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>${title}</h1>
          </div>
          <div class="print-meta">
            <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')} | عدد السجلات: ${data.length}</p>
          </div>
          <table>
            <thead>${head}</thead>
            <tbody>${body}</tbody>
          </table>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const handleExportCsv = () => {
    const isInvoices = reportType === "فواتير";
    const data = results || [];
    if (!data.length) {
      alert("لا توجد بيانات للتصدير");
      return;
    }

    const escapeVal = (v) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    let headers = [];
    let rows = [];

    if (isInvoices) {
      headers = [
        "#",
        "نوع العملية",
        "تاريخ الإصدار",
        ...(canViewPrices ? ["الإجمالي"] : []),
        "الحالة",
        "اسم الموظف",
        "اسم العميل",
        "المراجع",
        "عامل المخزن",
        "الماكينة",
        "الميكانيزم",
        "المورد",
      ];
      rows = data.map((inv) => [
        inv.id ?? "-",
        inv.type ?? "-",
        inv.created_at ? inv.created_at.split(" ")[0] : "-",
        ...(canViewPrices
          ? [
              ["طلب شراء", "تحويل"].includes(inv.type)
                ? "-"
                : inv.total_amount ?? 0,
            ]
          : []),
        STATUS_EN_TO_AR[inv.status]?.text || inv.status || "-",
        inv.employee_name || "-",
        inv.client_name || "-",
        inv.accreditation_manager || "-",
        inv.warehouse_manager || "-",
        inv.machine || "-",
        inv.mechanism || "-",
        inv.supplier || "-",
      ]);
    } else {
      headers = ["#", "اسم العنصر", "باركود العنصر", "تاريخ الإنشاء"];
      rows = data.map((item) => [
        item.id ?? "-",
        item.item_name ?? "-",
        item.item_bar ?? "-",
        item.created_at ? item.created_at.split(" ")[0] : "-",
      ]);
    }

    const csvLines = [
      headers.map(escapeVal).join(","),
      ...rows.map((r) => r.map(escapeVal).join(",")),
    ];
    const csv = csvLines.join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${
      isInvoices ? "تقرير_فواتير" : "تقرير_مخازن"
    }_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="h-20 w-20 border-4 border-blue-200 rounded-full"></div>
          <div className="h-20 w-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <p className="mt-6 text-lg font-medium text-gray-700">جاري تحميل النتائج...</p>
        <p className="mt-2 text-sm text-gray-500">يرجى الانتظار قليلاً</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                type="button"
                onClick={onBackToFilters}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-sm"
              >
                <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
                <span className="font-medium">عودة للفلاتر</span>
              </button>
              <div className="px-4 py-2 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-600">نوع التقرير:</span>
                <span className="font-semibold text-blue-600 mr-2"> {reportType}</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">نتائج البحث</h2>
            <p className="text-gray-600 mt-1">تم العثور على {totalItems} نتيجة</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              طباعة
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              تصدير CSV
            </button>
          </div>
        </div>
      </div>

      {/* Results Content */}
      {!results.length ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-gray-100 rounded-full">
            <span className="text-4xl">🔍</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">لا توجد نتائج</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            لم يتم العثور على نتائج مطابقة لمعايير البحث المحددة. حاول تعديل الفلاتر للحصول على نتائج.
          </p>
          <button
            type="button"
            onClick={onBackToFilters}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            تعديل الفلاتر
          </button>
        </div>
      ) : reportType === "فواتير" ? (
        <InvoicesTable
          rows={results}
          canViewPrices={canViewPrices}
          onOpenInvoice={onOpenInvoice}
          onOpenInvoiceDetails={onOpenInvoiceDetails}
        />
      ) : (
        <ItemsTable rows={results} onOpenItemDetails={onOpenItemDetails} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              عرض <span className="font-semibold text-gray-900">{(page * 10) + 1}-{Math.min((page + 1) * 10, totalItems)}</span> من أصل <span className="font-semibold text-gray-900">{totalItems}</span> نتيجة
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 0}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
                السابق
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (page < 3) {
                    pageNum = i;
                  } else if (page > totalPages - 4) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => onPageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        page === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                
                {totalPages > 5 && page < totalPages - 3 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <button
                      type="button"
                      onClick={() => onPageChange(totalPages - 1)}
                      className="w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page + 1 >= totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                التالي
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              الصفحة <span className="font-semibold text-gray-900">{page + 1}</span> من <span className="font-semibold text-gray-900">{totalPages}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== جدول الفواتير =====
function InvoicesTable({
  rows,
  canViewPrices,
  onOpenInvoice,
  onOpenInvoiceDetails,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg ">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-800 to-gray-900">
            <tr>
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-white border-l border-gray-700">
                الإجراءات
              </th>
              {canViewPrices && (
                <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-white border-l border-gray-700">
                  الإجمالي
                </th>
              )}
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-white border-l border-gray-700">
                العناصر
              </th>
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-white border-l border-gray-700">
                المورد
              </th>
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-white border-l border-gray-700">
                الميكانيزم
              </th>
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-white border-l border-gray-700">
                الماكينة
              </th>
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-white border-l border-gray-700">
                الموظف
              </th>
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-white border-l border-gray-700">
                الحالة
              </th>
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-white border-l border-gray-700">
                المراجع
              </th>
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-white border-l border-gray-700">
                عامل المخزن
              </th>
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-white border-l border-gray-700">
                العميل
              </th>
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-white border-l border-gray-700">
                النوع
              </th>
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-white border-l border-gray-700">
                التاريخ
              </th>
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-white">
                #
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((inv, index) => {
              const showDetailsButton =
                canViewPrices &&
                !["اضافه", "مرتجع", "طلب شراء", "تحويل"].includes(inv.type);

              return (
                <tr 
                  key={inv.id} 
                  className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenInvoice(inv)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium hover:from-blue-600 hover:to-blue-700 shadow-sm transition-all duration-300 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        فتح
                      </button>
                      {showDetailsButton && (
                        <button
                          type="button"
                          onClick={() => onOpenInvoiceDetails(inv)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-medium hover:from-emerald-600 hover:to-emerald-700 shadow-sm transition-all duration-300 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                          </svg>
                          تفاصيل
                        </button>
                      )}
                    </div>
                  </td>

                  {canViewPrices && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="font-bold text-blue-700 text-lg">
                        {["طلب شراء", "تحويل"].includes(inv.type)
                          ? "-"
                          : (inv.total_amount ?? 0).toLocaleString()}
                        <span className="text-sm text-gray-500 mr-1">ج</span>
                      </div>
                    </td>
                  )}

                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-right">
                      <span className="line-clamp-2 text-gray-800">
                        {(inv.items || []).map((it) => it.item_name).join("، ")}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {(inv.items || []).length} عنصر
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                    {inv.supplier || "-"}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                    {inv.mechanism || "-"}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                    {inv.machine || "-"}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="font-medium text-gray-900">{inv.employee_name || "-"}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${STATUS_EN_TO_AR[inv.status]?.color || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                      {STATUS_EN_TO_AR[inv.status]?.text || inv.status || "-"}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                    {inv.accreditation_manager || "-"}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700">
                    {inv.warehouse_manager || "-"}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="font-medium text-gray-900">{inv.client_name || "-"}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${TYPE_COLORS[inv.type] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                      {inv.type || "-"}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-gray-700">
                      {inv.created_at ? inv.created_at.split(" ")[0] : "-"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {inv.created_at ? inv.created_at.split(" ")[1]?.substring(0, 5) : ""}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="font-bold text-gray-900 text-lg">#{inv.id}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== جدول المخازن =====
function ItemsTable({ rows, onOpenItemDetails }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg ">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-800 to-gray-900">
            <tr>
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-white border-l border-gray-700">
                الإجراءات
              </th>
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-white border-l border-gray-700">
                باركود العنصر
              </th>
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-white border-l border-gray-700">
                اسم العنصر
              </th>
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-white border-l border-gray-700">
                تاريخ الإنشاء
              </th>
              <th scope="col" className="px-6 py-4 text-right text-sm font-semibold text-white">
                #
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((item, index) => (
              <tr 
                key={item.id} 
                className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onOpenItemDetails(item)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium hover:from-blue-600 hover:to-blue-700 shadow-sm transition-all duration-300 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    التفاصيل
                  </button>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="font-mono text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 inline-block">
                    {item.item_bar}
                  </div>
                </td>
                
                <td className="px-6 py-4 text-right">
                  <div className="font-semibold text-gray-900">{item.item_name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {item.locations?.length || 0} موقع
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-gray-700">
                    {item.created_at ? item.created_at.split(" ")[0] : "-"}
                  </div>
                  <div className="text-xs text-gray-500">
                    منذ {item.created_at ? Math.floor((new Date() - new Date(item.created_at)) / (1000 * 60 * 60 * 24)) : "?"} يوم
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="font-bold text-gray-900 text-lg">#{item.id}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}