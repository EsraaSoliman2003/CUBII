import React, { useEffect, useState } from "react";
import { priceReport } from "../../../api/modules/invoicesApi";

const DetailItem = ({ label, value, emphasize }) => (
  <div className="flex flex-col items-center min-w-[120px] text-xs">
    <span className="text-slate-500 mb-1">{label}</span>
    <span
      className={`font-semibold ${
        emphasize ? "text-emerald-600" : "text-slate-800"
      }`}
    >
      {value}
    </span>
  </div>
);

const InvoiceDetailsDialog = ({ open, onClose, invoiceId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !invoiceId) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await priceReport(invoiceId);
        setData(res.data);
      } catch (error) {
        console.error("Error loading price report", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [open, invoiceId]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-50 rounded-lg shadow-xl w-[95%] max-w-3xl max-h-[80vh] overflow-y-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
          <h2 className="text-lg font-bold text-slate-800">تفاصيل العناصر</h2>
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm rounded bg-slate-700 text-white hover:bg-slate-800"
          >
            إغلاق
          </button>
        </div>

        {loading && (
          <div className="py-8 text-center text-slate-500 text-sm">
            جاري تحميل تفاصيل الأسعار...
          </div>
        )}

        {!loading &&
          (data?.items || []).map((item) => (
            <div
              key={item.item_id}
              className="mb-3 bg-white rounded-md shadow-sm p-3 border border-slate-100"
            >
              <h3 className="text-sm font-bold text-cyan-700 mb-2">
                {item.item_name}
              </h3>
              <div className="flex flex-wrap gap-2 mb-2">
                <DetailItem label="الباركود" value={item.barcode} />
                <DetailItem label="الموقع" value={item.location} />
                <DetailItem label="الكمية" value={item.quantity} />
                <DetailItem
                  label="سعر الوحدة"
                  value={`${item.unit_price} ج`}
                />
                <DetailItem
                  label="السعر الكلي"
                  value={`${item.total_price} ج`}
                />
                <DetailItem
                  label="عدد المصادر"
                  value={
                    item.price_breakdowns?.filter(
                      (b) => Number(b.quantity) !== 0
                    ).length || 0
                  }
                />
              </div>

              {(item.price_breakdowns || [])
                .filter((b) => Number(b.quantity) !== 0)
                .map((breakdown, idx) => (
                  <div
                    key={idx}
                    className="mt-2 bg-slate-50 rounded-md p-2 border-r-4 border-cyan-600"
                  >
                    <h4 className="text-xs font-semibold text-slate-800 mb-2">
                      المصدر رقم {idx + 1}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <DetailItem
                        label="رقم الفاتورة"
                        value={breakdown.source_invoice_id}
                      />
                      <DetailItem
                        label="تاريخ الفاتورة"
                        value={breakdown.source_invoice_date}
                      />
                      <DetailItem
                        label="الكمية"
                        value={breakdown.quantity}
                      />
                      <DetailItem
                        label="سعر الوحدة"
                        value={`${breakdown.unit_price} ج`}
                      />
                      <DetailItem
                        label="الإجمالي"
                        value={`${breakdown.subtotal} ج`}
                      />
                      <DetailItem
                        label="النسبة من الإجمالي"
                        value={`${breakdown.percentage_of_total}%`}
                        emphasize
                      />
                    </div>
                  </div>
                ))}
            </div>
          ))}

        {!loading && (!data || (data.items || []).length === 0) && (
          <div className="py-6 text-center text-slate-500 text-sm">
            لا توجد بيانات تفصيلية لعرضها
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailsDialog;
