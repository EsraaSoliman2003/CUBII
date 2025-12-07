// src/features/invoices/pages/CreateInvoicePage.jsx
import React, { useState } from "react";
import { useInvoiceForm } from "../hooks/useInvoiceForm";
import InvoiceLayout from "../components/InvoiceLayout";
import SnackBar from "../../../components/common/SnackBar";
import { useInvoicePrint } from "../hooks/useInvoicePrint";
import TypeSelector from "../../../components/common/TypeSelector";

const operationTypes = ["صرف", "أمانات", "مرتجع", "توالف", "حجز", "تحويل"];
const purchasesTypes = ["اضافه"];

export default function CreateInvoicePage() {
  const {
    user,
    userLoading,
    voucherNumber,
    invoice,
    setInvoice,
    purchaseOrderInvoice,
    setPurchaseOrderInvoice,
    operationType,
    purchasesType,
    isInvoiceSaved,
    isPurchaseOrder,
    setIsPurchaseOrder,
    isPurchaseOrderSaved,
    isPurchaseOrderEditing,
    editingMode,
    selectedNowType,
    addRow,
    removeRow,
    date,
    time,
    showCommentField,
    setShowCommentField,
    showPurchaseOrderCommentField,
    setShowPurchaseOrderCommentField,
    handleTypeChange,
    handleSaveInvoice,
    handleSavePurchaseOrder,
    clearInvoice,
    clearPurchaseOrder,
    isSaving,
  } = useInvoiceForm();

  // ✅ هنا بنحدد هل يقدر يشوف الأسعار ولا لا
  const canViewPrices = user?.view_prices || user?.username === "admin";

  // ✅ Hooks لازم تكون برا أي if
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });

  const { handlePrint } = useInvoicePrint();

  // ⏳ تحميل بيانات المستخدم
  if (userLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // لو الـ user ملحقش يتجاب لأي سبب
  if (!user) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center text-red-600 font-semibold">
        فشل تحميل بيانات المستخدم
      </div>
    );
  }

  // 🚫 صلاحيات
  if (
    !user?.create_additions &&
    !user?.create_inventory_operations &&
    user?.username !== "admin"
  ) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center text-red-600 font-semibold">
        هذه الصفحة غير متوفرة
      </div>
    );
  }

  // ========= دوال المساعدة للـ Snackbar =========
  const showError = (message) =>
    setSnackbar({ open: true, message, type: "error" });

  const onSaveInvoice = async () => {
    try {
      await handleSaveInvoice();
      setSnackbar({
        open: true,
        message: "تم حفظ الفاتورة بنجاح",
        type: "success",
      });
    } catch (e) {
      showError(e.message || "حدث خطأ في حفظ الفاتورة");
    }
  };

  const onSavePO = async () => {
    try {
      await handleSavePurchaseOrder();
      setSnackbar({
        open: true,
        message: "تم حفظ طلب الشراء بنجاح",
        type: "success",
      });
    } catch (e) {
      showError(e.message || "حدث خطأ في حفظ طلب الشراء");
    }
  };

  // ========= JSX =========
  return (
    <div className="pt-4 pb-12 w-[90%] mx-auto mt-24" dir="rtl">
      {/* اختيار النوع */}
      {!isInvoiceSaved && (
        <div className="flex flex-wrap justify-center items-center gap-6 mb-4">
          {(user?.create_additions || user?.username === "admin") && (
            <TypeSelector
              label="مشتريات"
              value={purchasesType}
              options={purchasesTypes}
              onChange={(e) => handleTypeChange(e.target.value, true)}
            />
          )}

          {(user?.create_inventory_operations ||
            user?.username === "admin") && (
            <TypeSelector
              label="عمليات"
              value={operationType}
              options={operationTypes}
              onChange={(e) => handleTypeChange(e.target.value, false)}
            />
          )}

          <div className="flex items-center">
            {!isPurchaseOrder ? (
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm"
                onClick={() => setIsPurchaseOrder(true)}
              >
                طلب شراء
              </button>
            ) : (
              <button
                type="button"
                className="px-4 py-2 rounded-md border border-red-500 text-red-600 text-sm"
                onClick={() => setIsPurchaseOrder(false)}
              >
                إلغاء
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-5 overflow-x-auto">
        {/* الفاتورة الرئيسية */}
        <div className={isPurchaseOrder ? "flex-1" : "flex-[1.2]"}>
          <InvoiceLayout
            className="printable-invoice"
            selectedInvoice={{
              ...invoice,
              id: invoice.id ?? voucherNumber?.last_id,
              date,
              time,
              employee_name: user?.username,
            }}
            isEditing={editingMode}
            editingInvoice={invoice}
            setEditingInvoice={setInvoice}
            selectedNowType={selectedNowType}
            addRow={() => addRow(false)}
            deleteRow={(i) => removeRow(i, false)}
            isPurchasesType={!!purchasesType}
            showCommentField={showCommentField}
            isCreate
            canViewPrices={canViewPrices}
          />

          <div className="mt-4 flex flex-wrap justify-between gap-3">
            {!isInvoiceSaved ? (
              <>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold flex-1 min-w-[120px] ${
                    showCommentField
                      ? "border border-red-500 text-red-600 bg-white"
                      : "bg-green-600 text-white"
                  }`}
                  onClick={() => setShowCommentField(!showCommentField)}
                >
                  {showCommentField ? "إلغاء التعليق" : "إضافة تعليق"}
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg text-sm font-semibold flex-1 min-w-[120px] bg-blue-600 text-white disabled:opacity-60"
                  onClick={onSaveInvoice}
                >
                  {isSaving ? "جاري الحفظ..." : "تأكيد الحفظ"}
                </button>

                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-sm font-semibold flex-1 min-w-[120px] bg-cyan-600 text-white"
                  onClick={clearInvoice}
                >
                  فاتورة جديدة
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-sm font-semibold flex-1 min-w-[120px] bg-blue-600 text-white"
                  onClick={clearInvoice}
                >
                  فاتورة جديدة
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg text-sm font-semibold flex-1 min-w-[120px] bg-green-600 text-white"
                  onClick={() => handlePrint("printable-invoice")}
                >
                  طباعة الفاتورة
                </button>
              </>
            )}
          </div>
        </div>

        {/* طلب الشراء */}
        {isPurchaseOrder && (
          <div className="flex-1">
            <InvoiceLayout
              className="printable-purchase-order"
              selectedInvoice={{
                ...purchaseOrderInvoice,
                id: purchaseOrderInvoice.id ?? voucherNumber?.last_id,
                type: "طلب شراء",
                date,
                time,
                employee_name: user?.username,
              }}
              isEditing={isPurchaseOrderEditing}
              editingInvoice={purchaseOrderInvoice}
              setEditingInvoice={setPurchaseOrderInvoice}
              selectedNowType={{ type: "طلب شراء" }}
              addRow={() => addRow(true)}
              deleteRow={(i) => removeRow(i, true)}
              isPurchasesType={false}
              showCommentField={showPurchaseOrderCommentField}
              isCreate
              canViewPrices={canViewPrices}
            />

            <div className="mt-4 flex flex-wrap justify-between gap-3">
              {!isPurchaseOrderSaved ? (
                <>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg text-sm font-semibold flex-1 min-w-[120px] ${
                      showPurchaseOrderCommentField
                        ? "border border-red-500 text-red-600 bg-white"
                        : "bg-green-600 text-white"
                    }`}
                    onClick={() =>
                      setShowPurchaseOrderCommentField(
                        !showPurchaseOrderCommentField
                      )
                    }
                  >
                    {showPurchaseOrderCommentField
                      ? "إلغاء التعليق"
                      : "إضافة تعليق"}
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg text-sm font-semibold flex-1 min-w-[120px] bg-blue-600 text-white disabled:opacity-60"
                    onClick={onSavePO}
                  >
                    {isSaving ? "جاري الحفظ..." : "تأكيد الحفظ"}
                  </button>

                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg text-sm font-semibold flex-1 min-w-[120px] bg-cyan-600 text-white"
                    onClick={clearPurchaseOrder}
                  >
                    طلب جديد
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg text-sm font-semibold flex-1 min-w-[120px] bg-blue-600 text-white"
                    onClick={clearPurchaseOrder}
                  >
                    طلب جديد
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg text-sm font-semibold flex-1 min-w-[120px] bg-green-600 text-white"
                    onClick={() => handlePrint("printable-purchase-order")}
                  >
                    طباعة الطلب
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <SnackBar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
      />
    </div>
  );
}
