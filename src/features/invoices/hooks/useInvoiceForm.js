// src/features/invoices/hooks/useInvoiceForm.js
import { useState, useEffect, useMemo, useCallback } from "react";
import { getCurrentUser } from "../../../api/modules/usersApi";
import {
  getLastInvoiceId,
  createInvoice as apiCreateInvoice,
} from "../../../api/modules/invoicesApi";

export const LOCAL_STORAGE_KEY = "invoiceDraft";
export const PURCHASE_ORDER_LOCAL_STORAGE_KEY = "purchaseOrderDraft";

export const initialInvoiceState = {
  id: null,
  supplier_name: "",
  type: "",
  client_name: "",
  warehouse_manager: "",
  total_amount: 0,
  employee_name: "",
  machine_name: "",
  mechanism_name: "",
  items: [
    {
      item_name: "",
      barcode: "",
      quantity: 0,
      location: "",
      unit_price: 0,
      total_price: 0,
      description: "",
      supplier_name: "",
      new_location: "",
    },
  ],
  comment: "",
  payment_method: "Cash",
  amount_paid: 0,
  remain_amount: 0,
};

export function useInvoiceForm() {
  // ========= user =========
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      setUserLoading(true);

      try {
        const res = await getCurrentUser();
        if (cancelled) return;

        setUser(res.data);
        setInvoice((prev) => ({
          ...prev,
          employee_name: res.data.username,
        }));
        setPurchaseOrderInvoice((prev) => ({
          ...prev,
          employee_name: res.data.username,
        }));
      } catch (err) {
        if (cancelled) return;
        console.error("getCurrentUser error", err);
      } finally {
        if (!cancelled) {
          setUserLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, []);

  // ========= last invoice id =========
  const [voucherNumber, setVoucherNumber] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchLastId = useCallback(async () => {
    try {
      const res = await getLastInvoiceId(); // 👈 هنا بنجيب الـ response
      const data = res.data; // 👈 هنا بنطلع الـ data بس
      setVoucherNumber(data);
      return { data };
    } catch (error) {
      console.error("Failed to fetch last invoice id", error);
      return { data: null, error };
    }
  }, []);

  useEffect(() => {
    fetchLastId();
  }, [fetchLastId]);

  const [operationType, setOperationType] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved).operationType : "";
  });

  const [purchasesType, setPurchasesType] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved).purchasesType : "";
  });

  const [invoice, setInvoice] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return initialInvoiceState;
    const parsed = JSON.parse(saved);
    return {
      ...initialInvoiceState,
      ...parsed.newInvoice,
      type: parsed.operationType || parsed.purchasesType || "",
      id: parsed.newInvoice?.id || null,
    };
  });

  const [showCommentField, setShowCommentField] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved).showCommentField : false;
  });

  const [isInvoiceSaved, setIsInvoiceSaved] = useState(false);
  const [editingMode, setEditingMode] = useState(true);

  // طلب شراء داخلي
  const [isPurchaseOrder, setIsPurchaseOrder] = useState(false);
  const [purchaseOrderInvoice, setPurchaseOrderInvoice] = useState(() => {
    const saved = localStorage.getItem(PURCHASE_ORDER_LOCAL_STORAGE_KEY);
    if (!saved) return { ...initialInvoiceState, type: "طلب شراء", id: null };
    const parsed = JSON.parse(saved);
    return {
      ...initialInvoiceState,
      ...parsed.purchaseOrderInvoice,
      type: "طلب شراء",
      id: parsed.purchaseOrderInvoice?.id || null,
    };
  });
  const [isPurchaseOrderSaved, setIsPurchaseOrderSaved] = useState(false);
  const [isPurchaseOrderEditing, setIsPurchaseOrderEditing] = useState(true);
  const [showPurchaseOrderCommentField, setShowPurchaseOrderCommentField] =
    useState(false);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const today = new Date();
    setDate(today.toISOString().split("T")[0]);
    setTime(
      today.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );
  }, [isInvoiceSaved, isPurchaseOrderSaved]);

  const selectedNowType = useMemo(
    () => ({ type: purchasesType || operationType }),
    [purchasesType, operationType]
  );

  const totalAmount = useMemo(
    () =>
      invoice.items
        .reduce((sum, row) => sum + (Number(row.total_price) || 0), 0)
        .toFixed(2),
    [invoice.items]
  );

  const purchaseOrderTotalAmount = useMemo(
    () =>
      purchaseOrderInvoice.items
        .reduce((sum, row) => sum + (Number(row.total_price) || 0), 0)
        .toFixed(2),
    [purchaseOrderInvoice.items]
  );

  const handleTypeChange = useCallback((type, isPurchase) => {
    if (isPurchase) {
      setPurchasesType(type);
      setOperationType("");
    } else {
      setOperationType(type);
      setPurchasesType("");
    }

    setInvoice((prev) => ({
      ...prev,
      type,
      original_invoice_id: null,
    }));

    setPurchaseOrderInvoice((prev) => ({
      ...prev,
      original_invoice_id: null,
    }));
  }, []);

  const addRow = useCallback((forPurchaseOrder = false) => {
    const setState = forPurchaseOrder ? setPurchaseOrderInvoice : setInvoice;
    setState((prev) => ({
      ...prev,
      items: [...prev.items, { ...initialInvoiceState.items[0] }],
    }));
  }, []);

  const removeRow = useCallback((index, forPurchaseOrder = false) => {
    const setState = forPurchaseOrder ? setPurchaseOrderInvoice : setInvoice;
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []);

  // حفظ في localStorage – مع إجبار الكمية 0 في المسودة
  useEffect(() => {
    if (!isInvoiceSaved) {
      const draft = {
        newInvoice: {
          ...invoice,
          items: invoice.items.map((item) => ({
            ...item,
            quantity: 0,
          })),
        },
        operationType,
        purchasesType,
        showCommentField,
        isInvoiceSaved,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft));
    }
  }, [invoice, operationType, purchasesType, showCommentField, isInvoiceSaved]);

  useEffect(() => {
    if (!isPurchaseOrderSaved) {
      const draft = {
        purchaseOrderInvoice: {
          ...purchaseOrderInvoice,
          items: purchaseOrderInvoice.items.map((item) => ({
            ...item,
            quantity: 0,
          })),
        },
        isPurchaseOrderSaved,
      };
      localStorage.setItem(
        PURCHASE_ORDER_LOCAL_STORAGE_KEY,
        JSON.stringify(draft)
      );
    }
  }, [purchaseOrderInvoice, isPurchaseOrderSaved]);

  // ========= Validation =========

  const validateRequiredFields = (inv, isPO = false) => {
    if (!inv.type) return "يجب تحديد نوع العملية";

    const requiredFields = isPO
      ? ["machine_name", "mechanism_name"]
      : inv.type === "مرتجع"
        ? ["machine_name", "mechanism_name", "original_invoice_id"]
        : ["machine_name", "mechanism_name"];

    const missing = requiredFields.filter((f) => !inv[f]);
    if (missing.length > 0) {
      if (isPO) return "يجب ملء اسم الماكينة واسم الميكانيزم";
      if (inv.type === "مرتجع")
        return "يجب ملء اسم الماكينة واسم الميكانيزم ورقم الفاتورة الأصلية";
      return "يجب ملء اسم الماكينة واسم الميكانيزم";
    }

    if (inv.type === "اضافه") {
      const itemsWithoutSupplier = inv.items.filter(
        (it) => !it.supplier_name || it.supplier_name.trim() === ""
      );
      if (itemsWithoutSupplier.length > 0) {
        return "يجب تحديد اسم المورد لكل عنصر في الفاتورة";
      }
    }

    return null;
  };

  const validateItems = (items) => {
    const validItems = items.filter(
      (it) => Number(it.quantity) > 0 && !isNaN(Number(it.quantity))
    );
    if (validItems.length === 0) return "يجب ملء عنصر واحد على الأقل";
    return null;
  };

  const buildInvoicePayload = (inv, total, isPO = false) => {
    return {
      ...inv,
      items: inv.items
        .filter((it) => Number(it.quantity) > 0)
        .map((it) => ({
          item_name: it.item_name,
          barcode: it.barcode,
          location: it.location,
          new_location: it.new_location || "",
          quantity: Number(it.quantity),
          unit_price: Number(it.unit_price),
          total_price: Number(it.total_price),
          description: it.description,
          supplier_name: isPO ? "" : it.supplier_name || "",
        })),
      total_amount: total,
      employee_name: user?.username,
      id: inv.id ?? voucherNumber?.last_id,
      date,
      time,
    };
  };

  // ========= حفظ الفاتورة =========

  const handleSaveInvoice = async () => {
    const fieldError =
      validateRequiredFields(invoice, false) ||
      validateItems(invoice.items || []);
    if (fieldError) {
      throw new Error(fieldError);
    }

    let payload = buildInvoicePayload(invoice, totalAmount, false);

    if (["صرف", "أمانات", "مرتجع"].includes(invoice.type)) {
      payload = {
        ...payload,
        original_invoice_id: invoice.original_invoice_id
          ? Number(invoice.original_invoice_id)
          : 0,
      };
    } else {
      delete payload.original_invoice_id;
    }

    setIsSaving(true);
    try {
      const res = await apiCreateInvoice(payload); // 👈 هنا
      const data = res.data; // 👈 وهنا
      setIsInvoiceSaved(true);
      setEditingMode(false);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setInvoice((prev) => ({
        ...prev,
        id: payload.id,
      }));
      return data; // لو حابة ترجعي الريسبونس الحقيقي
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePurchaseOrder = async () => {
    const fieldError =
      validateRequiredFields(purchaseOrderInvoice, true) ||
      validateItems(purchaseOrderInvoice.items || []);
    if (fieldError) {
      throw new Error(fieldError);
    }

    let payload = buildInvoicePayload(
      purchaseOrderInvoice,
      purchaseOrderTotalAmount,
      true
    );
    delete payload.original_invoice_id;

    setIsSaving(true);
    try {
      const res = await apiCreateInvoice(payload); // 👈
      const data = res.data; // 👈
      setIsPurchaseOrderSaved(true);
      setIsPurchaseOrderEditing(false);
      localStorage.removeItem(PURCHASE_ORDER_LOCAL_STORAGE_KEY);
      setPurchaseOrderInvoice((prev) => ({
        ...prev,
        id: payload.id,
      }));
      return data;
    } finally {
      setIsSaving(false);
    }
  };

  const clearInvoice = async () => {
    setOperationType("");
    setPurchasesType("");
    setShowCommentField(false);
    setIsInvoiceSaved(false);
    setEditingMode(true);
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    try {
      const { data: updated } = await fetchLastId();
      const newId = updated?.last_id ?? null;
      setInvoice({
        ...initialInvoiceState,
        id: newId,
      });
    } catch {
      setInvoice({
        ...initialInvoiceState,
        id: null,
      });
    }
  };

  const clearPurchaseOrder = async () => {
    setIsPurchaseOrderSaved(false);
    setIsPurchaseOrderEditing(true);
    setShowPurchaseOrderCommentField(false);
    localStorage.removeItem(PURCHASE_ORDER_LOCAL_STORAGE_KEY);

    try {
      const { data: updated } = await fetchLastId();
      const newId = updated?.last_id ?? null;
      setPurchaseOrderInvoice({
        ...initialInvoiceState,
        type: "طلب شراء",
        id: newId,
      });
    } catch {
      setPurchaseOrderInvoice({
        ...initialInvoiceState,
        type: "طلب شراء",
        id: null,
      });
    }
  };

  return {
    user,
    userLoading,

    voucherNumber,
    isSaving,
    invoice,
    setInvoice,
    purchaseOrderInvoice,
    setPurchaseOrderInvoice,
    operationType,
    purchasesType,
    setOperationType,
    setPurchasesType,
    isInvoiceSaved,
    setIsInvoiceSaved,
    editingMode,
    setEditingMode,
    isPurchaseOrder,
    setIsPurchaseOrder,
    isPurchaseOrderSaved,
    setIsPurchaseOrderSaved,
    isPurchaseOrderEditing,
    setIsPurchaseOrderEditing,
    selectedNowType,
    totalAmount,
    purchaseOrderTotalAmount,
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
  };
}
