// src/features/reports/components/ItemDetailsDialog.jsx
import React, { useMemo, useState } from "react";

export default function ItemDetailsDialog({
  open,
  onClose,
  item,
  canViewPrices = false,
}) {
  const [activeTab, setActiveTab] = useState("locations"); // 'locations' | 'prices' | 'history'

  const statusMap = useMemo(
    () => ({
      draft: { text: "لم تراجع", color: "bg-red-100 text-red-800 border-red-200" },
      accreditation: { text: "لم تؤكد", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      confirmed: { text: "تم", color: "bg-green-100 text-green-800 border-green-200" },
      partially_returned: { text: "استرداد جزئي", color: "bg-blue-100 text-blue-800 border-blue-200" },
      returned: { text: "تم الاسترداد", color: "bg-emerald-100 text-emerald-800 border-emerald-200" }
    }),
    []
  );

  if (!open) return null;

  const locations = item?.locations || [];
  const prices = item?.prices || [];
  const invoiceHistory = item?.invoice_history || [];

  // Calculate statistics
  const totalQuantity = locations.reduce((sum, loc) => sum + (Number(loc.quantity) || 0), 0);
  const totalLocations = locations.length;
  const totalInvoices = invoiceHistory.length;

  const exportTabToCsv = (tab) => {
    let headers = [];
    let rows = [];

    const escapeVal = (v) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    if (tab === "locations") {
      headers = ["الموقع", "الكمية", "النسبة"];
      rows = locations.map((loc) => [
        loc.location ?? "-",
        loc.quantity ?? "0",
        totalQuantity > 0 ? `${((Number(loc.quantity) / totalQuantity) * 100).toFixed(1)}%` : "0%"
      ]);
    } else if (tab === "prices") {
      headers = [];
      if (canViewPrices) headers.push("سعر الوحدة");
      headers.push("الكمية", "التاريخ", "# الفاتورة", "النوع");

      rows = prices.map((p) => {
        const base = [];
        if (canViewPrices) base.push(p.unit_price ?? "-");
        base.push(
          p.quantity ?? "-",
          p.created_at ? p.created_at.split(" ")[0] : "-",
          p.invoice_id ?? "-",
          p.type || "-"
        );
        return base;
      });
    } else if (tab === "history") {
      headers = [];
      if (canViewPrices) headers.push("سعر الوحدة");
      headers.push(
        "الكمية",
        "الموقع",
        "الماكينة",
        "الميكانيزم",
        ...(canViewPrices ? ["الإجمالي"] : []),
        "الحالة",
        "التاريخ",
        "النوع",
        "# الفاتورة"
      );

      rows = invoiceHistory.map((h) => {
        const arr = [];
        if (canViewPrices)
          arr.push(
            ["طلب شراء", "تحويل"].includes(h.invoice_type)
              ? "-"
              : h.unit_price ?? "-"
          );
        arr.push(
          h.quantity ?? "-",
          h.invoice_type === "تحويل" ? h.new_location ?? "-" : h.location ?? "-",
          h.machine ?? "-",
          h.mechanism ?? "-"
        );
        if (canViewPrices)
          arr.push(
            h.invoice_type === "طلب شراء" ? "-" : h.total_price ?? "-"
          );
        arr.push(
          statusMap[h.status]?.text || h.status || "-",
          h.invoice_date ? h.invoice_date.split(" ")[0] : "-",
          h.invoice_type ?? "-",
          h.invoice_id ?? "-"
        );
        return arr;
      });
    }

    if (!headers.length) return;

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
    link.download = `تفاصيل_${item?.item_bar || "item"}_${tab}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printTab = (tab) => {
    const win = window.open("", "_blank");
    if (!win) return;

    let title = "";
    let head = "";
    let body = "";

    if (tab === "locations") {
      title = "المواقع";
      head = `
        <tr>
          <th>الموقع</th>
          <th>الكمية</th>
          <th>النسبة</th>
        </tr>
      `;
      body = (locations || [])
        .map(
          (loc) => `
          <tr>
            <td>${loc.location ?? "-"}</td>
            <td>${loc.quantity ?? "0"}</td>
            <td>${totalQuantity > 0 ? ((Number(loc.quantity) / totalQuantity) * 100).toFixed(1) : "0"}%</td>
          </tr>
        `
        )
        .join("");
    } else if (tab === "prices") {
      title = "الأسعار";
      head = `
        <tr>
          ${canViewPrices ? "<th>سعر الوحدة</th>" : ""}
          <th>الكمية</th>
          <th>التاريخ</th>
          <th># الفاتورة</th>
          <th>النوع</th>
        </tr>
      `;
      body = (prices || [])
        .map(
          (p) => `
          <tr>
            ${
              canViewPrices
                ? `<td>${p.unit_price ?? "-"}</td>`
                : ""
            }
            <td>${p.quantity ?? "-"}</td>
            <td>${p.created_at ? p.created_at.split(" ")[0] : "-"}</td>
            <td>${p.invoice_id ?? "-"}</td>
            <td>${p.type || "-"}</td>
          </tr>
        `
        )
        .join("");
    } else if (tab === "history") {
      title = "تاريخ الفواتير";
      head = `
        <tr>
          ${canViewPrices ? "<th>سعر الوحدة</th>" : ""}
          <th>الكمية</th>
          <th>الموقع</th>
          <th>الماكينة</th>
          <th>الميكانيزم</th>
          ${canViewPrices ? "<th>الإجمالي</th>" : ""}
          <th>الحالة</th>
          <th>التاريخ</th>
          <th>النوع</th>
          <th># الفاتورة</th>
        </tr>
      `;
      body = (invoiceHistory || [])
        .map(
          (h) => `
          <tr>
            ${
              canViewPrices
                ? `<td>${
                    ["طلب شراء", "تحويل"].includes(h.invoice_type)
                      ? "-"
                      : h.unit_price ?? "-"
                  }</td>`
                : ""
            }
            <td>${h.quantity ?? "-"}</td>
            <td>${
              h.invoice_type === "تحويل"
                ? h.new_location ?? "-"
                : h.location ?? "-"
            }</td>
            <td>${h.machine ?? "-"}</td>
            <td>${h.mechanism ?? "-"}</td>
            ${
              canViewPrices
                ? `<td>${
                    h.invoice_type === "طلب شراء" ? "-" : h.total_price ?? "-"
                  }</td>`
                : ""
            }
            <td>${statusMap[h.status]?.text || h.status || "-"}</td>
            <td>${h.invoice_date ? h.invoice_date.split(" ")[0] : "-"}</td>
            <td>${h.invoice_type ?? "-"}</td>
            <td>${h.invoice_id ?? "-"}</td>
          </tr>
        `
        )
        .join("");
    }

    win.document.write(`
      <html dir="rtl" lang="ar">
      <head>
        <title>طباعة ${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap');
          body { 
            font-family: 'Cairo', sans-serif; 
            padding: 25px;
            background: #f8fafc;
          }
          .print-container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .print-header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #3b82f6;
          }
          .print-header h2 {
            color: #1e3a8a;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
          }
          .print-meta {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          .meta-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .meta-label {
            color: #64748b;
            font-weight: 500;
          }
          .meta-value {
            color: #1e293b;
            font-weight: 600;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            border: 1px solid #cbd5e1;
          }
          th {
            background: #1e293b;
            color: white;
            padding: 14px 10px;
            font-weight: 600;
            font-size: 13px;
            border: 1px solid #334155;
          }
          td {
            padding: 12px 10px;
            border: 1px solid #cbd5e1;
            text-align: center;
            font-size: 12.5px;
          }
          tr:nth-child(even) {
            background: #f8fafc;
          }
          .status-badge {
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11.5px;
            font-weight: 600;
            display: inline-block;
          }
          .print-footer {
            margin-top: 25px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="print-header">
            <h2>تقرير ${title} – ${item?.item_name || ""}</h2>
          </div>
          
          <div class="print-meta">
            <div class="meta-item">
              <span class="meta-label">اسم العنصر:</span>
              <span class="meta-value">${item?.item_name || "-"}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">باركود:</span>
              <span class="meta-value">${item?.item_bar || "-"}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">تاريخ الإنشاء:</span>
              <span class="meta-value">${item?.created_at ? item.created_at.split(" ")[0] : "-"}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">عدد السجلات:</span>
              <span class="meta-value">${tab === "locations" ? locations.length : tab === "prices" ? prices.length : invoiceHistory.length}</span>
            </div>
          </div>
          
          <table>
            <thead>${head}</thead>
            <tbody>${body}</tbody>
          </table>
          
          <div class="print-footer">
            <p>تم الطباعة في: ${new Date().toLocaleDateString('ar-EG')} ${new Date().toLocaleTimeString('ar-EG')}</p>
            <p>© ${new Date().getFullYear()} نظام إدارة المخازن</p>
          </div>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl text-white">📦</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">تفاصيل العنصر</h2>
              <p className="text-blue-100 text-sm">عرض كامل المعلومات والتفاصيل</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white text-lg flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Basic Info Cards */}
        <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">اسم العنصر</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{item?.item_name ?? "-"}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl text-blue-600">🏷️</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">باركود العنصر</p>
                  <p className="text-lg font-bold text-gray-900 font-mono mt-1">{item?.item_bar ?? "-"}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl text-green-600">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الكمية</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{totalQuantity.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl text-purple-600">📦</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">عدد المواقع</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{totalLocations}</p>
                </div>
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl text-amber-600">📍</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            {[
              { id: "locations", label: "المواقع", icon: "📍", count: locations.length },
              { id: "prices", label: "الأسعار", icon: "💰", count: prices.length },
              { id: "history", label: "تاريخ الفواتير", icon: "📜", count: invoiceHistory.length }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-200 text-gray-700"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}

            <div className="ml-auto flex items-center gap-3 px-6">
              <button
                type="button"
                onClick={() => printTab(activeTab)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                </svg>
                طباعة
              </button>
              <button
                type="button"
                onClick={() => exportTabToCsv(activeTab)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-colors flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                تصدير CSV
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "locations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">توزيع الكمية على المواقع</h3>
                <div className="text-sm text-gray-600">
                  إجمالي الكمية: <span className="font-bold text-gray-900">{totalQuantity.toLocaleString()}</span>
                </div>
              </div>
              
              {locations.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
                    <span className="text-2xl">🏷️</span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">لا توجد مواقع</h4>
                  <p className="text-gray-500">لم يتم إضافة هذا العنصر إلى أي موقع بعد</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locations.map((loc, idx) => {
                    const percentage = totalQuantity > 0 ? (Number(loc.quantity) / totalQuantity) * 100 : 0;
                    return (
                      <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600">📍</span>
                            </div>
                            <h4 className="font-medium text-gray-900">الموقع #{idx + 1}</h4>
                          </div>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">الموقع:</span>
                            <span className="font-medium text-gray-900">{loc.location || "-"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">الكمية:</span>
                            <span className="font-bold text-blue-600">{(loc.quantity || 0).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "prices" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">سجل الأسعار</h3>
                <div className="text-sm text-gray-600">
                  عدد السجلات: <span className="font-bold text-gray-900">{prices.length}</span>
                </div>
              </div>
              
              {prices.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">لا توجد أسعار</h4>
                  <p className="text-gray-500">لم يتم تسجيل أي سعر لهذا العنصر بعد</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {canViewPrices && (
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            سعر الوحدة
                          </th>
                        )}
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          الكمية
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          التاريخ
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          # الفاتورة
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          النوع
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {prices.map((p, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          {canViewPrices && (
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-right">
                                <span className="font-bold text-blue-700">{(p.unit_price || 0).toLocaleString()}</span>
                                <span className="text-sm text-gray-500 mr-1"> ج</span>
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900">
                            {(p.quantity || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="text-gray-700">{p.created_at ? p.created_at.split(" ")[0] : "-"}</div>
                            <div className="text-xs text-gray-500">{p.created_at ? p.created_at.split(" ")[1]?.substring(0, 5) : ""}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="font-medium text-gray-900">#{p.invoice_id || "-"}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                              {p.type || "-"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">تاريخ الحركات</h3>
                <div className="text-sm text-gray-600">
                  عدد الفواتير: <span className="font-bold text-gray-900">{invoiceHistory.length}</span>
                </div>
              </div>
              
              {invoiceHistory.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
                    <span className="text-2xl">📜</span>
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">لا توجد حركات</h4>
                  <p className="text-gray-500">لم يتم تسجيل أي حركة لهذا العنصر بعد</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoiceHistory.map((h, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            h.invoice_type === "اضافه" ? "bg-green-100" :
                            h.invoice_type === "صرف" ? "bg-red-100" :
                            h.invoice_type === "مرتجع" ? "bg-yellow-100" :
                            "bg-blue-100"
                          }`}>
                            <span className={`text-lg ${
                              h.invoice_type === "اضافه" ? "text-green-600" :
                              h.invoice_type === "صرف" ? "text-red-600" :
                              h.invoice_type === "مرتجع" ? "text-yellow-600" :
                              "text-blue-600"
                            }`}>
                              {h.invoice_type === "اضافه" ? "⬆️" :
                               h.invoice_type === "صرف" ? "⬇️" :
                               h.invoice_type === "مرتجع" ? "↩️" : "📄"}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">فاتورة #{h.invoice_id}</h4>
                            <p className="text-sm text-gray-600">{h.invoice_date ? h.invoice_date.split(" ")[0] : "-"}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusMap[h.status]?.color || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                            {statusMap[h.status]?.text || h.status || "-"}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-lg">
                            {h.invoice_type || "-"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">الكمية</div>
                          <div className="font-bold text-gray-900">{(h.quantity || 0).toLocaleString()}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">الموقع</div>
                          <div className="font-medium text-gray-900">
                            {h.invoice_type === "تحويل" ? h.new_location || "-" : h.location || "-"}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">الماكينة</div>
                          <div className="font-medium text-gray-900">{h.machine || "-"}</div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">الميكانيزم</div>
                          <div className="font-medium text-gray-900">{h.mechanism || "-"}</div>
                        </div>
                      </div>
                      
                      {canViewPrices && h.invoice_type !== "طلب شراء" && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">القيمة الإجمالية</span>
                            <span className="font-bold text-blue-700 text-lg">
                              {(h.total_price || 0).toLocaleString()}
                              <span className="text-sm text-gray-500 mr-1"> ج</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}