// src/features/invoices/components/InvoiceItemsTable.jsx
import React, { useMemo, useState, useEffect } from "react";
import CustomAutoCompleteField from "../../../components/common/CustomAutoCompleteField";
import NumberInput from "../../../components/common/NumberInput";
import SnackBar from "../../../components/common/SnackBar";
import { getSuppliers } from "../../../api/modules/suppliersApi";
import { getWarehouses } from "../../../api/modules/warehousesApi";

import ReturnQuantityDialog from "./ReturnQuantityDialog";

export default function InvoiceItemsTable({
  selectedInvoice,
  editingInvoice,
  setEditingInvoice,
  isEditing,
  selectedNowType,
  addRow,
  deleteRow,
  isPurchasesType = false,
  justEditUnitPrice = false,
  canEsterdad = false,
  setSelectedInvoice,
  canViewPrices = false,
  isCreate = false,
}) {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });

  const [suppliers, setSuppliers] = useState([]);
  const [isSuppliersLoading, setIsSuppliersLoading] = useState(false);

  const [warehouse, setWarehouse] = useState([]);
  const [isWarehousesLoading, setIsWarehousesLoading] = useState(false);

  const isAdditionType =
    selectedNowType?.type === "اضافه" ||
    selectedInvoice?.type === "اضافه" ||
    editingInvoice?.type === "اضافه";

  const isTransferType =
    selectedNowType?.type === "تحويل" ||
    selectedInvoice?.type === "تحويل" ||
    editingInvoice?.type === "تحويل";

  const isAmanatType =
    selectedNowType?.type === "أمانات" ||
    selectedInvoice?.type === "أمانات" ||
    editingInvoice?.type === "أمانات";

  const showReturnedQtyColumn = isAmanatType && canEsterdad;

  // تحميل الموردين
  useEffect(() => {
    const shouldFetch = isEditing && isAdditionType && !justEditUnitPrice;

    if (!shouldFetch) return;

    let mounted = true;
    setIsSuppliersLoading(true);

    getSuppliers({ all: true })
      .then((res) => {
        if (!mounted) return;

        const data = res.data;

        setSuppliers(data.suppliers || []);
      })
      .catch((err) => {
        console.error("getSuppliers error", err);
      })
      .finally(() => {
        if (mounted) setIsSuppliersLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isEditing, isAdditionType, justEditUnitPrice]);

  // تحميل المخازن
  useEffect(() => {
    const shouldFetch = isEditing && !justEditUnitPrice;
    if (!shouldFetch) return;

    let mounted = true;
    setIsWarehousesLoading(true);

    getWarehouses({ all: true })
      .then((res) => {
        if (!mounted) return;

        const data = res.data;
        setWarehouse(data.warehouses || []);
      })
      .catch((err) => {
        console.error("getWarehouses error", err);
      })
      .finally(() => {
        if (mounted) setIsWarehousesLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isEditing, justEditUnitPrice]);

  // خريطة حسب الباركود (الاسم ممكن يتكرر، الباركود هو الفاصل)
  const warehouseByBarcode = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(warehouse)) return map;
    warehouse.forEach((item) => {
      if (item.item_bar) {
        map.set(item.item_bar, item);
      }
    });
    return map;
  }, [warehouse]);

  const itemOptions = useMemo(() => {
    if (!Array.isArray(warehouse)) return [];
    return warehouse.map((it) => ({
      label: `${it.item_name} - ${it.item_bar}`,
      item_name: it.item_name,
      barcode: it.item_bar,
      locations: it.locations || [],
    }));
  }, [warehouse]);

  const handleChangeItem = (rowIndex, option) => {
    const updatedItems = [...editingInvoice.items];

    if (!option) {
      updatedItems[rowIndex] = {
        ...updatedItems[rowIndex],
        item_name: "",
        barcode: "",
        location: "",
        availableLocations: [],
        quantity: 0,
        unit_price: 0,
        total_price: 0,
      };
    } else {
      updatedItems[rowIndex] = {
        ...updatedItems[rowIndex],
        item_name: option.item_name,
        barcode: option.barcode, // 👈 التمييز الأساسي
        location: "",
        availableLocations: option.locations || [],
        quantity: 0,
        unit_price: 0,
        total_price: 0,
      };
    }

    setEditingInvoice({ ...editingInvoice, items: updatedItems });
  };

  const handleChangeLocation = (rowIndex, locObj) => {
    if (!locObj || !locObj.location) return;

    const updatedItems = [...editingInvoice.items];
    const row = updatedItems[rowIndex];

    // maxquantity من المخزون حسب الباركود + الموقع
    let maxquantity = 0;
    const whItem = warehouseByBarcode.get(row.barcode);
    if (whItem) {
      const foundLoc = (whItem.locations || []).find(
        (l) => l.location === locObj.location
      );
      if (foundLoc) {
        maxquantity = Number(foundLoc.quantity) || 0;
      }
    }

    updatedItems[rowIndex] = {
      ...row,
      location: locObj.location,
      maxquantity,
      quantity: 0,
      total_price: 0,
      unit_price:
        !isAdditionType && locObj.unit_price
          ? locObj.unit_price
          : row.unit_price,
    };

    setEditingInvoice({ ...editingInvoice, items: updatedItems });
  };

  const handleChangeQuantity = (rowIndex, value) => {
    const updatedItems = [...editingInvoice.items];
    const row = updatedItems[rowIndex];

    let q = Math.max(0, Number(value) || 0);

    if (
      !isAdditionType &&
      !isTransferType &&
      selectedInvoice.type !== "طلب شراء"
    ) {
      if (q > (row.maxquantity || 0)) {
        setSnackbar({
          open: true,
          message: `الكمية القصوى المسموح بها هي ${row.maxquantity || 0}`,
          type: "warning",
        });
      }
      q = Math.min(q, row.maxquantity || 0);
    }

    updatedItems[rowIndex] = {
      ...row,
      quantity: q,
      total_price: q * Number(row.unit_price || 0),
    };

    const total_amount = updatedItems.reduce(
      (sum, it) => sum + (Number(it.total_price) || 0),
      0
    );

    setEditingInvoice({
      ...editingInvoice,
      items: updatedItems,
      total_amount,
    });
  };

  const handleChangeUnitPrice = (rowIndex, value) => {
    const updatedItems = [...editingInvoice.items];
    const row = updatedItems[rowIndex];
    const p = Math.max(0, Number(value) || 0);

    updatedItems[rowIndex] = {
      ...row,
      unit_price: p,
      total_price: p * Number(row.quantity || 0),
    };

    const total_amount = updatedItems.reduce(
      (sum, it) => sum + (Number(it.total_price) || 0),
      0
    );

    setEditingInvoice({
      ...editingInvoice,
      items: updatedItems,
      total_amount,
    });
  };

  const handleChangeDescription = (rowIndex, value) => {
    const updatedItems = [...editingInvoice.items];
    updatedItems[rowIndex] = {
      ...updatedItems[rowIndex],
      description: value,
    };
    setEditingInvoice({ ...editingInvoice, items: updatedItems });
  };

  const items = isEditing ? editingInvoice.items : selectedInvoice.items;

  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnItemIndex, setReturnItemIndex] = useState(null);

  return (
    <>
      <div className="mt-3 border border-gray-300 rounded-md" dir="rtl">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 text-gray-800">
            <tr>
              <th className="border border-gray-300 px-2 py-1 text-center w-10">
                {isEditing && !justEditUnitPrice ? (
                  <button
                    type="button"
                    onClick={addRow}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-base leading-none"
                    title="إضافة سطر"
                  >
                    +
                  </button>
                ) : (
                  "#"
                )}
              </th>
              {isAdditionType && (
                <th className="border border-gray-300 px-2 py-1">اسم المورد</th>
              )}
              <th className="border border-gray-300 px-2 py-1">
                الصنف / الباركود
              </th>
              <th className="border border-gray-300 px-2 py-1">الباركود</th>
              <th className="border border-gray-300 px-2 py-1">الموقع</th>
              <th className="border border-gray-300 px-2 py-1">الكمية</th>

              {showReturnedQtyColumn && (
                <th className="border border-gray-300 px-2 py-1">
                  الكمية المستردة
                </th>
              )}

              {isTransferType && (
                <th className="border border-gray-300 px-2 py-1">
                  الموقع الجديد
                </th>
              )}
              {canViewPrices && ((isCreate && isAdditionType) || !isCreate) && (
                <>
                  <th className="border border-gray-300 px-2 py-1">السعر</th>
                  <th className="border border-gray-300 px-2 py-1">
                    إجمالي السعر
                  </th>
                </>
              )}
              <th className="border border-gray-300 px-2 py-1">بيان</th>
            </tr>
          </thead>

          <tbody>
            {items.map((row, index) => {
              // نفس الصنف من نسخة الفاتورة الأصلية (selectedInvoice)
              const originalRow =
                Array.isArray(selectedInvoice?.items) &&
                selectedInvoice.items[index]
                  ? selectedInvoice.items[index]
                  : row;

              const totalReturned =
                typeof originalRow?.total_returned === "number"
                  ? originalRow.total_returned
                  : 0;

              const isFullyReturned =
                originalRow?.is_fully_returned ||
                (typeof totalReturned === "number" &&
                  typeof originalRow?.quantity === "number" &&
                  totalReturned >= originalRow.quantity);

              return (
                <tr key={index} className="even:bg-gray-50">
                  {/* index + delete + استرداد */}
                  <td className="border border-gray-300 px-2 py-1 text-center align-middle relative">
                    <span>{index + 1}</span>
                    {isEditing && !justEditUnitPrice && (
                      <button
                        type="button"
                        onClick={() => deleteRow(index)}
                        className="absolute -left-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-red-600 text-xs hover:bg-red-50"
                        title="حذف السطر"
                      >
                        ✕
                      </button>
                    )}
                    {isAmanatType &&
                      canEsterdad &&
                      !isEditing &&
                      !!setSelectedInvoice &&
                      !isFullyReturned &&
                      selectedInvoice?.status !== "returned" &&
                      selectedInvoice?.status !== "تم الاسترداد" && (
                        <button
                          type="button"
                          className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-blue-600 text-xs hover:bg-blue-50"
                          title="استرداد"
                          onClick={() => {
                            setReturnItemIndex(index);
                            setReturnDialogOpen(true);
                          }}
                        >
                          ⟲
                        </button>
                      )}
                  </td>

                  {/* supplier */}
                  {isAdditionType && (
                    <td className="border border-gray-300 px-2 py-1">
                      {isEditing && !justEditUnitPrice ? (
                        <CustomAutoCompleteField
                          isLoading={isSuppliersLoading}
                          values={suppliers}
                          editingItem={row}
                          fieldName="supplier_name"
                          setEditingItem={(newRow) => {
                            const updated = [...editingInvoice.items];
                            updated[index] = {
                              ...updated[index],
                              supplier_name:
                                newRow.supplier_name || newRow.name || "",
                            };
                            setEditingInvoice({
                              ...editingInvoice,
                              items: updated,
                            });
                          }}
                          placeholder="اسم المورد"
                          isBig
                        />
                      ) : (
                        <span>{row.supplier_name || "-"}</span>
                      )}
                    </td>
                  )}

                  {/* item (name + barcode) */}
                  <td className="border border-gray-300 px-2 py-1 min-w-[220px]">
                    {isEditing && !justEditUnitPrice ? (
                      <CustomAutoCompleteField
                        isLoading={isWarehousesLoading}
                        values={itemOptions}
                        editingItem={{
                          ...row,
                          item_name: `${row.item_name || ""}${
                            row.barcode ? ` - ${row.barcode}` : ""
                          }`,
                        }}
                        fieldName="item_name"
                        placeholder="الصنف (اسم - باركود)"
                        isBig
                        setEditingItem={(_, option) => {
                          handleChangeItem(index, option || null);
                        }}
                      />
                    ) : (
                      <span>
                        {row.item_name}
                        {row.barcode ? ` - ${row.barcode}` : ""}
                      </span>
                    )}
                  </td>

                  {/* barcode only */}
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    {row.barcode}
                  </td>

                  {/* location */}
                  <td className="border border-gray-300 px-2 py-1 min-w-[180px]">
                    {isEditing && !justEditUnitPrice ? (
                      <CustomAutoCompleteField
                        // isLoading={row.item_name === "" ? false : true}
                        values={row.availableLocations || []}
                        editingItem={row}
                        fieldName="location"
                        placeholder="الموقع"
                        setEditingItem={(newRow) => {
                          if (!newRow.location) return;
                          handleChangeLocation(index, newRow);
                        }}
                      />
                    ) : (
                      <span>{row.location}</span>
                    )}
                  </td>

                  {/* quantity */}
                  <td className="border border-gray-300 px-1 py-1 w-24 text-center">
                    {isEditing ? (
                      <NumberInput
                        value={row.quantity}
                        className="w-full h-8 text-center text-sm border-0"
                        onClick={(e) => {
                          if (!row.location) {
                            setSnackbar({
                              open: true,
                              message: "يجب تحديد موقع العنصر أولا",
                              type: "info",
                            });
                            e.target.blur();
                          }
                        }}
                        onChange={(e) => {
                          if (!row.location) {
                            setSnackbar({
                              open: true,
                              message: "يجب تحديد موقع العنصر أولا",
                              type: "info",
                            });
                            e.target.blur();
                            return;
                          }
                          handleChangeQuantity(index, e.target.value);
                        }}
                      />
                    ) : (
                      <span>{row.quantity}</span>
                    )}
                  </td>

                  {/* returned quantity */}
                  {showReturnedQtyColumn && (
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {totalReturned}
                    </td>
                  )}

                  {/* transfer: new_location */}
                  {isTransferType && (
                    <td className="border border-gray-300 px-2 py-1 min-w-[180px]">
                      {isEditing && !justEditUnitPrice ? (
                        <CustomAutoCompleteField
                          // isLoading={row.item_name === "" ? false : true}
                          values={(row.availableLocations || []).filter(
                            (l) => l.location !== row.location
                          )}
                          editingItem={row}
                          fieldName="new_location"
                          placeholder="الموقع الجديد"
                          setEditingItem={(newRow) => {
                            const updated = [...editingInvoice.items];
                            updated[index] = {
                              ...updated[index],
                              new_location: newRow.new_location || "",
                            };
                            setEditingInvoice({
                              ...editingInvoice,
                              items: updated,
                            });
                          }}
                        />
                      ) : (
                        <span>{row.new_location || "-"}</span>
                      )}
                    </td>
                  )}

                  {/* price + total */}
                  {canViewPrices &&
                    ((isCreate && isAdditionType) || !isCreate) && (
                      <>
                        <td className="border border-gray-300 px-1 py-1 w-24 text-center">
                          {isEditing && isAdditionType ? (
                            <NumberInput
                              value={row.unit_price}
                              className="w-full h-8 text-center text-sm border-0"
                              onClick={(e) => {
                                if (!row.location) {
                                  setSnackbar({
                                    open: true,
                                    message: "يجب تحديد موقع العنصر أولا",
                                    type: "info",
                                  });
                                  e.target.blur();
                                }
                              }}
                              onChange={(e) => {
                                if (!row.location) {
                                  setSnackbar({
                                    open: true,
                                    message: "يجب تحديد موقع العنصر أولا",
                                    type: "info",
                                  });
                                  e.target.blur();
                                  return;
                                }
                                handleChangeUnitPrice(index, e.target.value);
                              }}
                            />
                          ) : (
                            <span>{row.unit_price}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          {isEditing && !justEditUnitPrice && !isAdditionType
                            ? "-"
                            : row.total_price}
                        </td>
                      </>
                    )}

                  {/* description */}
                  <td className="border border-gray-300 px-2 py-1 max-w-xs">
                    {isEditing && !justEditUnitPrice ? (
                      <textarea
                        className="w-full h-8 text-right text-xs border-0 outline-none resize-none"
                        value={row.description || ""}
                        onChange={(e) =>
                          handleChangeDescription(index, e.target.value)
                        }
                      />
                    ) : (
                      <span className="text-xs">{row.description}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {canEsterdad && isAmanatType && (
        <ReturnQuantityDialog
          open={returnDialogOpen}
          onClose={() => setReturnDialogOpen(false)}
          selectedInvoice={selectedInvoice}
          selectedItemIndex={returnItemIndex}
          setSelectedInvoice={setSelectedInvoice}
        />
      )}

      <SnackBar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
      />
    </>
  );
}
