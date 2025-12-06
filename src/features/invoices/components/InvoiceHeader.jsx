// src/features/invoices/components/InvoiceHeader.jsx
import React from "react";
import logo from "../../../assets/logo.png";

export default function InvoiceHeader({ invoice }) {
  return (
    <div className="flex items-center justify-between mb-4 gap-4" dir="rtl">
      {/* Logo */}
      <div className="flex-1">
        <img src={logo} alt="Logo" className="w-40 md:w-56" />
      </div>

      {/* نوع العملية */}
      <div className="flex-1 text-center leading-relaxed">
        <div className="font-bold text-gray-800 text-base md:text-lg">
          نوع العملية
        </div>
        <div className="font-bold text-gray-700 text-base md:text-lg">
          {invoice.type}
        </div>
      </div>

      {/* معلومات السند */}
      <div className="flex-1 flex flex-col items-center text-sm text-gray-600">
        <div className="flex gap-1">
          <span className="font-semibold">رقم السند:</span>
          <span>{invoice.id}</span>
        </div>
        <div className="flex gap-1">
          <span className="font-semibold">التاريخ:</span>
          <span>{invoice.date}</span>
        </div>
        <div className="flex gap-1">
          <span className="font-semibold">الوقت:</span>
          <span>{invoice.time}</span>
        </div>
      </div>
    </div>
  );
}
