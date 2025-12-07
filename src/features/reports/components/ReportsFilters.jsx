// src/features/reports/components/ReportsFilters.jsx
import React from "react";
import TypeSelector from "../../../components/common/TypeSelector";
import CustomAutoCompleteField from "../../../components/common/CustomAutoCompleteField";
import NumberInput from "../../../components/common/NumberInput";

const INVOICE_TYPES = [
  { name: "اضافه", color: "bg-green-100 text-green-800" },
  { name: "صرف", color: "bg-red-100 text-red-800" },
  { name: "أمانات", color: "bg-blue-100 text-blue-800" },
  { name: "مرتجع", color: "bg-yellow-100 text-yellow-800" },
  { name: "توالف", color: "bg-gray-100 text-gray-800" },
  { name: "حجز", color: "bg-purple-100 text-purple-800" },
  { name: "طلب شراء", color: "bg-indigo-100 text-indigo-800" },
  { name: "تحويل", color: "bg-cyan-100 text-cyan-800" },
  { name: "الكل", color: "bg-gray-800 text-white" }
];

const STATUS_TYPES = [
  { name: "لم تراجع", color: "bg-red-100 text-red-800" },
  { name: "لم تؤكد", color: "bg-yellow-100 text-yellow-800" },
  { name: "تم", color: "bg-green-100 text-green-800" },
  { name: "استرداد جزئي", color: "bg-blue-100 text-blue-800" },
  { name: "تم الاسترداد", color: "bg-emerald-100 text-emerald-800" }
];

export default function ReportsFilters({
  reportType,
  onReportTypeChange,
  filters,
  errors,
  onFilterChange,
  onSearch,
  isSearching,
  loadingStates,
  options,
}) {
  const {
    loadingUsers,
    loadingMachines,
    loadingMechanisms,
    loadingSuppliers,
    loadingItems,
  } = loadingStates;

  const {
    employeeOptions,
    machinesOptions,
    mechanismsOptions,
    suppliersOptions,
    itemsNameOptions,
    itemsBarcodeOptions,
    statusOptions,
  } = options;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">بحث متقدم في التقارير</h2>
        <p className="text-gray-600">استخدم الفلاتر أدناه للحصول على النتائج المطلوبة بدقة</p>
      </div>

      {/* Report Type Selector */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-md">
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
              اختر نوع التقرير
            </label>
          </div>
          <div className="flex gap-3 justify-center">
            {["فواتير", "مخازن"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onReportTypeChange(type)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  reportType === type
                    ? "bg-blue-600 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {reportType && (
        <div className="space-y-8">
          {/* فلاتر الفواتير */}
          {reportType === "فواتير" && (
            <>
              {/* Section Header */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-800">فلاتر الفواتير</h3>
                <p className="text-sm text-gray-600">حدد معايير البحث للحصول على الفواتير المطلوبة</p>
              </div>

              {/* الصف الأول */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* الموظف */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    اسم الموظف
                  </label>
                  <div className="relative">
                    <CustomAutoCompleteField
                      isLoading={loadingUsers}
                      values={employeeOptions}
                      editingItem={{ employee_name: filters.employee_name }}
                      fieldName="employee_name"
                      placeholder="ابحث عن موظف..."
                      setEditingItem={(row) =>
                        onFilterChange(
                          "employee_name",
                          row.employee_name || row.name || ""
                        )
                      }
                    />
                  </div>
                </div>

                {/* نوع العملية */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    نوع العملية
                  </label>
                  <div className="relative">
                    <CustomAutoCompleteField
                      values={INVOICE_TYPES}
                      editingItem={{ type: filters.type }}
                      fieldName="type"
                      placeholder="اختر نوع العملية"
                      setEditingItem={(row) =>
                        onFilterChange("type", row.type || row.name || "")
                      }
                    />
                  </div>
                </div>

                {/* اسم العميل */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    اسم العميل
                  </label>
                  <div className="relative">
                    <input
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="اسم العميل"
                      value={filters.client_name}
                      onChange={(e) => onFilterChange("client_name", e.target.value)}
                    />
                  </div>
                </div>

                {/* المراجع */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    المراجع
                  </label>
                  <div className="relative">
                    <CustomAutoCompleteField
                      isLoading={loadingUsers}
                      values={employeeOptions}
                      editingItem={{
                        accreditation_manager: filters.accreditation_manager,
                      }}
                      fieldName="accreditation_manager"
                      placeholder="ابحث عن مراجع..."
                      setEditingItem={(row) =>
                        onFilterChange(
                          "accreditation_manager",
                          row.accreditation_manager || row.name || ""
                        )
                      }
                    />
                  </div>
                </div>

                {/* عامل المخزن */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    عامل المخزن
                  </label>
                  <div className="relative">
                    <CustomAutoCompleteField
                      isLoading={loadingUsers}
                      values={employeeOptions}
                      editingItem={{
                        warehouse_manager: filters.warehouse_manager,
                      }}
                      fieldName="warehouse_manager"
                      placeholder="ابحث عن عامل مخزن..."
                      setEditingItem={(row) =>
                        onFilterChange(
                          "warehouse_manager",
                          row.warehouse_manager || row.name || ""
                        )
                      }
                    />
                  </div>
                </div>

                {/* الحالة */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    حالة الفاتورة
                  </label>
                  <div className="relative">
                    <CustomAutoCompleteField
                      values={STATUS_TYPES}
                      editingItem={{ status: filters.status }}
                      fieldName="status"
                      placeholder="اختر الحالة"
                      setEditingItem={(row) =>
                        onFilterChange("status", row.status || row.name || "")
                      }
                    />
                  </div>
                </div>
              </div>

              {/* الصف الثاني */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* الماكينة */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    الماكينة
                  </label>
                  <div className="relative">
                    <CustomAutoCompleteField
                      isBig
                      isLoading={loadingMachines}
                      values={machinesOptions}
                      editingItem={{ machine: filters.machine }}
                      fieldName="machine"
                      placeholder="ابحث عن ماكينة..."
                      setEditingItem={(row) =>
                        onFilterChange("machine", row.machine || row.name || "")
                      }
                    />
                  </div>
                </div>

                {/* الميكانيزم */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    الميكانيزم
                  </label>
                  <div className="relative">
                    <CustomAutoCompleteField
                      isBig
                      isLoading={loadingMechanisms}
                      values={mechanismsOptions}
                      editingItem={{ mechanism: filters.mechanism }}
                      fieldName="mechanism"
                      placeholder="ابحث عن ميكانيزم..."
                      setEditingItem={(row) =>
                        onFilterChange("mechanism", row.mechanism || row.name || "")
                      }
                    />
                  </div>
                </div>

                {/* المورد */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    المورد
                  </label>
                  <div className="relative">
                    <CustomAutoCompleteField
                      isBig
                      isLoading={loadingSuppliers}
                      values={suppliersOptions}
                      editingItem={{ supplier: filters.supplier }}
                      fieldName="supplier"
                      placeholder="ابحث عن مورد..."
                      setEditingItem={(row) =>
                        onFilterChange("supplier", row.supplier || row.name || "")
                      }
                    />
                  </div>
                </div>

                {/* رقم الفاتورة */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    رقم الفاتورة
                  </label>
                  <div className="relative">
                    <NumberInput
                      value={filters.invoice_id}
                      onChange={(e) => onFilterChange("invoice_id", e.target.value)}
                      className="w-full h-11 border border-gray-300 rounded-lg px-4 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل رقم الفاتورة"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* فلاتر المخازن */}
          {reportType === "مخازن" && (
            <>
              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-800">فلاتر المخازن</h3>
                <p className="text-sm text-gray-600">ابحث عن العناصر في المخازن</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    اسم العنصر
                  </label>
                  <div className="relative">
                    <CustomAutoCompleteField
                      isBig
                      isLoading={loadingItems}
                      values={itemsNameOptions}
                      editingItem={{ item_name: filters.item_name }}
                      fieldName="item_name"
                      placeholder="ابحث باسم العنصر..."
                      setEditingItem={(row) =>
                        onFilterChange("item_name", row.item_name || row.name || "")
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    باركود العنصر
                  </label>
                  <div className="relative">
                    <CustomAutoCompleteField
                      isBig
                      isLoading={loadingItems}
                      values={itemsBarcodeOptions}
                      editingItem={{ item_bar: filters.item_bar }}
                      fieldName="item_bar"
                      placeholder="ابحث بالباركود..."
                      setEditingItem={(row) =>
                        onFilterChange("item_bar", row.item_bar || row.name || "")
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* التاريخ من / إلى */}
          {reportType && (
            <>
              <div className="border-l-4 border-amber-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-800">الفترة الزمنية</h3>
                <p className="text-sm text-gray-600">حدد الفترة الزمنية للبحث</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    من تاريخ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      className={`w-full h-11 border rounded-lg px-4 text-sm focus:outline-none focus:ring-2 ${
                        errors.fromDate
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      } focus:border-transparent`}
                      value={filters.fromDate}
                      onChange={(e) => onFilterChange("fromDate", e.target.value)}
                      max={filters.toDate || undefined}
                    />
                    {errors.fromDate && (
                      <p className="text-xs text-red-500 mt-1">هذا الحقل مطلوب</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    إلى تاريخ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      className={`w-full h-11 border rounded-lg px-4 text-sm focus:outline-none focus:ring-2 ${
                        errors.toDate
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      } focus:border-transparent`}
                      value={filters.toDate}
                      onChange={(e) => onFilterChange("toDate", e.target.value)}
                      min={filters.fromDate || undefined}
                    />
                    {errors.toDate && (
                      <p className="text-xs text-red-500 mt-1">هذا الحقل مطلوب</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* زر البحث */}
          {reportType && (
            <div className="pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onSearch}
                disabled={isSearching}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSearching ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري البحث...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    بدء البحث
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Tips */}
      {reportType && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600">💡</span>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-1">نصائح سريعة</h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>يمكنك ترك الحقول فارغة للبحث في جميع السجلات</li>
                <li>استخدم تاريخ بداية ونهاية للحصول على نتائج دقيقة</li>
                <li>يمكنك الجمع بين أكثر من فلتر للحصول على نتائج محددة</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}