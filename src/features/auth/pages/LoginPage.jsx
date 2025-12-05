import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../../../api/modules/authApi";
import { getCurrentUser } from "../../../api/modules/usersApi";
import { useAuthStore } from "../../../store/useAuthStore";
import logo from "../../../assets/logo.png"; // عدّلي المسار لو محتاج

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNameError("");
    setPasswordError("");
    setSnackbarMessage("");

    if (!name) {
      setNameError("يرجى ادخال الاسم");
      return;
    }
    if (!password) {
      setPasswordError("يرجى ادخال كلمة المرور");
      return;
    }

    setIsLoading(true);

    try {
      // طلب تسجيل الدخول
      const res = await loginRequest({
        username: name,
        password: password,
      });

      const data = res.data;

      // نفس القديم: بنفترض إن الـ API بيرجع access_token
      const token = data?.access_token;
      if (!token) {
        setSnackbarMessage("لم يتم استلام التوكن من الخادم");
        setOpenSnackbar(true);
        return;
      }

      // حفظ التوكن في Zustand + localStorage
      login(token);

      // جلب بيانات المستخدم بعد التسجيل (بدل refetch من RTK)
      const userRes = await getCurrentUser();
      const updatedUser = userRes.data;

      // نفس منطق التوجيه بالظبط من الكود القديم:
      if (updatedUser?.username === "admin") {
        navigate("/employee");
      } else if (
        updatedUser?.create_inventory_operations ||
        updatedUser?.create_additions
      ) {
        navigate("/createinvoice");
      } else if (
        updatedUser?.view_additions ||
        updatedUser?.view_withdrawals ||
        updatedUser?.view_deposits ||
        updatedUser?.view_returns ||
        updatedUser?.view_damages ||
        updatedUser?.view_reservations ||
        updatedUser?.view_transfers ||
        updatedUser?.view_purchase_requests
      ) {
        navigate("/invoices");
      } else if (updatedUser?.view_reports) {
        // في القديم كنتِ كاتبة /others/reports
        // خليه /reports لو الروت الجديد كده، أو عدّليه
        navigate("/reports");
      } else if (
        updatedUser?.items_can_edit ||
        updatedUser?.items_can_delete ||
        updatedUser?.items_can_add
      ) {
        navigate("/others/items");
      } else if (
        updatedUser?.machines_can_edit ||
        updatedUser?.machines_can_delete ||
        updatedUser?.machines_can_add
      ) {
        navigate("/others/machines");
      } else if (
        updatedUser?.mechanism_can_edit ||
        updatedUser?.mechanism_can_delete ||
        updatedUser?.mechanism_can_add
      ) {
        navigate("/others/mechanisms");
      } else if (
        updatedUser?.suppliers_can_edit ||
        updatedUser?.suppliers_can_delete ||
        updatedUser?.suppliers_can_add
      ) {
        navigate("/others/supliers");
      } else {
        // fallback لو مفيش ولا صلاحية
        navigate("/login");
      }
    } catch (error) {
      console.error("Error:", error);
      const msg = error?.response?.data?.message;

      if (msg === "Invalid credentials") {
        setSnackbarMessage("اسم المستخدم أو كلمة المرور غير صحيحة");
      } else {
        setSnackbarMessage("حدث خطأ أثناء تسجيل الدخول");
      }
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-slate-900 text-white px-4">
      {/* الجزء الخاص باللوجو والنص الترحيبي */}
      <div className="w-full md:w-1/2 flex flex-col items-center mb-8 md:mb-0">
        <img
          src={logo}
          alt="logo"
          className="w-32 h-auto mb-4 select-none"
        />
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Welcome to CUBII
        </h1>
        <p className="text-slate-300 text-sm md:text-base">
          نظام إدارة المخزون - برجاء تسجيل الدخول للمتابعة
        </p>
      </div>

      {/* الفورم */}
      <div className="w-full md:w-1/2 max-w-md">
        <div className="bg-slate-800/80 rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex flex-col items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mb-2">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-xl font-semibold">تسجيل الدخول</h2>
          </div>

          {/* Snackbar بسيط */}
          {openSnackbar && (
            <div className="mb-4 text-sm text-red-100 bg-red-500/80 border border-red-400 rounded-md px-3 py-2 flex justify-between items-center">
              <span>{snackbarMessage}</span>
              <button
                type="button"
                onClick={handleCloseSnackbar}
                className="ml-2 text-xs underline"
              >
                إغلاق
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
            {/* اسم المستخدم */}
            <div>
              <label
                htmlFor="username"
                className="block mb-1 text-sm font-medium text-slate-100"
              >
                الاسم
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm bg-slate-900/60 text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  nameError ? "border-red-400" : "border-slate-500"
                }`}
                placeholder="ادخل اسم المستخدم"
              />
              {nameError && (
                <p className="mt-1 text-xs text-red-300">{nameError}</p>
              )}
            </div>

            {/* كلمة المرور */}
            <div>
              <label
                htmlFor="password"
                className="block mb-1 text-sm font-medium text-slate-100"
              >
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm bg-slate-900/60 text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  passwordError ? "border-red-400" : "border-slate-500"
                }`}
                placeholder="••••••••"
              />
              {passwordError && (
                <p className="mt-1 text-xs text-red-300">{passwordError}</p>
              )}
            </div>

            {/* زر الدخول + اللودر */}
            <div className="flex flex-col items-center mt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 text-sm shadow-lg shadow-blue-500/30 transition"
              >
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </button>

              {isLoading && (
                <div className="mt-3 h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
