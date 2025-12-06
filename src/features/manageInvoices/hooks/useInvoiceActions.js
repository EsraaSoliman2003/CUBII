import { useState } from "react";
import {
  confirmInvoice,
  deleteInvoice,
  returnWarrantyInvoice,
  confirmTalabSheraaInvoice,
  updateInvoice,
  getInvoice,
} from "../../../api/modules/invoicesApi";

/**
 * هُوك لكل أكشنات الفواتير: تأكيد / استرداد / حذف / قبول أو رفض طلب شراء
 * onRefresh: دالة لإعادة تحميل البيانات بعد أي تعديل
 * setAlert: دالة لعرض الرسائل في الصفحة الأساسية
 */
export function useInvoiceActions({ onRefresh, setAlert }) {
  const [confirmLoadingMap, setConfirmLoadingMap] = useState({});
  const [recoverLoadingMap, setRecoverLoadingMap] = useState({});
  const [singleDeleteLoading, setSingleDeleteLoading] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const setConfirmLoading = (id, value) => {
    setConfirmLoadingMap((prev) => ({ ...prev, [id]: value }));
  };

  const setRecoverLoading = (id, value) => {
    setRecoverLoadingMap((prev) => ({ ...prev, [id]: value }));
  };

  // تأكيد / تغيير حالة الفاتورة
  const handleConfirmStatus = async (invoice) => {
    const id = invoice.id;
    setConfirmLoading(id, true);
    try {
      await confirmInvoice(id);
      setAlert?.({
        type: "success",
        message: "تم تحديث حالة الفاتورة بنجاح",
      });
      await onRefresh?.();
    } catch (error) {
      console.error(error);
      setAlert?.({
        type: "error",
        message: "حدث خطأ أثناء تحديث الحالة",
      });
    } finally {
      setConfirmLoading(id, false);
    }
  };

  // استرداد أمانات
  const handleRecoverDeposit = async (invoice) => {
    const id = invoice.id;
    setRecoverLoading(id, true);
    try {
      await returnWarrantyInvoice({ id });
      setAlert?.({
        type: "success",
        message: "تم استرداد الأمانات بنجاح",
      });
      await onRefresh?.();
    } catch (error) {
      console.error(error);
      setAlert?.({
        type: "error",
        message: "حدث خطأ أثناء الاسترداد",
      });
    } finally {
      setRecoverLoading(id, false);
    }
  };

  // حذف فاتورة واحدة
  const handleDeleteOne = async (invoice) => {
    if (
      invoice.rawStatus === "confirmed" ||
      invoice.rawStatus === "returned" ||
      invoice.status === "تم" ||
      invoice.status === "تم الاسترداد"
    ) {
      setAlert?.({
        type: "warning",
        message: "لا يمكن حذف هذه الفاتورة لأنها مؤكدة أو تم استردادها",
      });
      return;
    }

    const confirmed = window.confirm(
      "هل أنت متأكد من رغبتك في حذف هذه الفاتورة؟"
    );
    if (!confirmed) return;

    setSingleDeleteLoading(true);
    try {
      await deleteInvoice(invoice.id);
      setAlert?.({
        type: "success",
        message: "تم حذف الفاتورة بنجاح",
      });
      await onRefresh?.();
    } catch (error) {
      console.error(error);
      setAlert?.({
        type: "error",
        message:
          "خطأ في الحذف، قد يكون هناك بيانات متعلقة بها أو أنها غير موجودة",
      });
    } finally {
      setSingleDeleteLoading(false);
    }
  };

  // حذف مجموعة فواتير
  const handleDeleteMany = async (selectedInvoices) => {
    if (!selectedInvoices || selectedInvoices.length === 0) return;

    const hasConfirmed = selectedInvoices.some(
      (invoice) =>
        invoice.rawStatus === "confirmed" ||
        invoice.rawStatus === "returned" ||
        invoice.status === "تم" ||
        invoice.status === "تم الاسترداد"
    );

    if (hasConfirmed) {
      setAlert?.({
        type: "warning",
        message: "لا يمكن حذف بعض الفواتير لأنها مؤكدة أو تم استردادها",
      });
      return;
    }

    const confirmed = window.confirm(
      "هل أنت متأكد من رغبتك في حذف الفواتير المحددة؟"
    );
    if (!confirmed) return;

    setBulkDeleteLoading(true);
    try {
      for (const invoice of selectedInvoices) {
        await deleteInvoice(invoice.id);
      }
      setAlert?.({
        type: "success",
        message: "تم حذف الفواتير المحددة بنجاح",
      });
      await onRefresh?.();
    } catch (error) {
      console.error(error);
      setAlert?.({
        type: "error",
        message:
          "خطأ في حذف بعض الفواتير، قد يكون هناك بيانات متعلقة بها أو أنها غير موجودة",
      });
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // قبول طلب شراء
  const handleAcceptPurchaseRequest = async (invoice) => {
    const id = invoice.id;
    setConfirmLoading(id, true);
    try {
      await confirmTalabSheraaInvoice({
        id,
        isPurchaseApproved: true,
      });
      setAlert?.({
        type: "success",
        message: "تم قبول طلب الشراء بنجاح",
      });
      await onRefresh?.();
    } catch (error) {
      console.error(error);
      setAlert?.({
        type: "error",
        message: "حدث خطأ أثناء قبول طلب الشراء",
      });
    } finally {
      setConfirmLoading(id, false);
    }
  };

  // رفض طلب شراء + حفظ سبب الرفض في تعليق الفاتورة
  const handleRejectPurchaseRequest = async (invoice) => {
    const id = invoice.id;
    const reason = window.prompt("من فضلك أدخل سبب الرفض:");

    if (!reason || !reason.trim()) {
      return;
    }

    setConfirmLoading(id, true);
    try {
      await confirmTalabSheraaInvoice({
        id,
        isPurchaseApproved: false,
      });

      // تحديث تعليق الفاتورة (comment)
      const res = await getInvoice(id);
      const currentInvoice = res.data;
      await updateInvoice({
        id,
        ...currentInvoice,
        comment: reason,
      });

      setAlert?.({
        type: "success",
        message: "تم رفض طلب الشراء وتسجيل سبب الرفض",
      });
      await onRefresh?.();
    } catch (error) {
      console.error(error);
      setAlert?.({
        type: "error",
        message: "خطأ في رفض طلب الشراء أو حفظ السبب",
      });
    } finally {
      setConfirmLoading(id, false);
    }
  };

  return {
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
  };
}
