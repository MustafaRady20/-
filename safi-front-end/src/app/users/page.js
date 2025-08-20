"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    role: "user",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    role: "user",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const router = useRouter();

  // إعداد axios
  const api = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // إضافة التوكن تلقائياً
  api.interceptors.request.use((config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // جلب جميع المستخدمين
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      console.log("تم جلب المستخدمين:", response.data);
      setUsers(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        router.push("/auth");
      } else {
        setError(err.response?.data?.message || "فشل في جلب المستخدمين");
      }
    } finally {
      setLoading(false);
    }
  };

  // إنشاء مستخدم جديد
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await api.post("/users", formData);
      setSuccess("تم إنشاء المستخدم بنجاح!");
      setFormData({ name: "", password: "", role: "user" });
      setShowForm(false);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "فشل في إنشاء المستخدم");
    } finally {
      setLoading(false);
    }
  };

  // تحديث المستخدم
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setEditLoading(true);

    console.log("تعديل المستخدم:", editingUser, editFormData);
    try {
      await api.patch(`/users/${editingUser}`, editFormData);
      setSuccess("تم تحديث المستخدم بنجاح!");
      setEditFormData({ name: "", role: "user" });
      setEditingUser(null);
      setShowEditModal(false);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "فشل في تحديث المستخدم");
    } finally {
      setEditLoading(false);
    }
  };

  // حذف المستخدم
  const handleDelete = async (userId) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;

    try {
      setLoading(true);
      await api.delete(`/users/${userId}`);
      setSuccess("تم حذف المستخدم بنجاح!");
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "فشل في حذف المستخدم");
    } finally {
      setLoading(false);
    }
  };

  // تعديل المستخدم - فتح نافذة منبثقة
  const handleEdit = async (userId) => {
    try {
      setError(null);
      setEditLoading(true);

      // البحث عن المستخدم في القائمة الحالية أولاً (أسرع)
      const currentUser = users.find((user) => user.id === userId);
      if (currentUser) {
        setEditFormData({
          name: currentUser.name,
          role: currentUser.role,
        });
        setEditingUser(userId);
        setShowEditModal(true);
        setEditLoading(false);
        return;
      }

      // احتياطي: جلب من API إذا لم يتم العثور في القائمة الحالية
      const response = await api.get(`/users/${userId}`);
      const user = response.data;

      setEditFormData({
        name: user.name,
        role: user.role,
      });
      setEditingUser(userId);
      setShowEditModal(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "فشل في تحميل بيانات المستخدم للتعديل"
      );
    } finally {
      setEditLoading(false);
    }
  };

  // إلغاء نموذج الإضافة
  const handleCancel = () => {
    setFormData({ name: "", password: "", role: "user" });
    setShowForm(false);
    setError(null);
    setSuccess(null);
  };

  // إلغاء نافذة التعديل
  const handleEditCancel = () => {
    setEditFormData({ name: "", role: "user" });
    setEditingUser(null);
    setShowEditModal(false);
    setError(null);
  };

  // معالجة تغييرات الإدخال لنموذج الإضافة
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // معالجة تغييرات الإدخال لنموذج التعديل
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // معالجة مفتاح Escape لإغلاق النافذة
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && showEditModal) {
        handleEditCancel();
      }
    };

    if (showEditModal) {
      document.addEventListener("keydown", handleEscapeKey);
      // منع تمرير الصفحة عند فتح النافذة
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [showEditModal]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:px-4 lg:px-8" dir="rtl">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              إدارة المستخدمين
            </h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 text-sm sm:text-base font-medium"
            >
              {showForm ? "إلغاء" : "إضافة مستخدم"}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded mb-4 text-sm sm:text-base">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-3 sm:px-4 py-3 rounded mb-4 text-sm sm:text-base">
              {success}
            </div>
          )}

          {/* نموذج إضافة مستخدم */}
          {showForm && (
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                إضافة مستخدم جديد
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="أدخل الاسم"
                    required
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                    required
                    minLength={6}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الدور
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    <option value="user">مستخدم</option>
                    <option value="admin">مدير</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition duration-200 text-sm sm:text-base font-medium"
                  >
                    {loading ? "جاري الإنشاء..." : "إنشاء مستخدم"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition duration-200 text-sm sm:text-base font-medium"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* قائمة المستخدمين */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              قائمة المستخدمين
            </h2>
            {loading && !showForm && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 text-sm sm:text-base">
                  جاري تحميل المستخدمين...
                </p>
              </div>
            )}
            {!loading && users.length === 0 && (
              <p className="text-gray-600 text-center py-8 text-sm sm:text-base">
                لا توجد مستخدمين.
              </p>
            )}
            {users.length > 0 && (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full px-4 sm:px-0">
                  <table className="w-full border-collapse border border-gray-300 min-w-[500px]">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 sm:px-4 py-2 text-right text-xs sm:text-sm">
                          المعرف
                        </th>
                        <th className="border border-gray-300 px-2 sm:px-4 py-2 text-right text-xs sm:text-sm">
                          الاسم
                        </th>
                        <th className="border border-gray-300 px-2 sm:px-4 py-2 text-right text-xs sm:text-sm">
                          الدور
                        </th>
                        <th className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">
                          العمليات
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 sm:px-4 py-2 font-mono text-xs sm:text-sm">
                            {user._id}
                          </td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">
                            {user.name}
                          </td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {user.role === "admin" ? "مدير" : "مستخدم"}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2 text-center">
                            <div className="flex flex-col sm:flex-row justify-center gap-1 sm:gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(user._id)}
                                disabled={editLoading}
                                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition duration-200 font-medium"
                              >
                                {editLoading ? "..." : "تعديل"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(user._id)}
                                disabled={loading}
                                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition duration-200 font-medium"
                              >
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* نافذة تعديل المستخدم */}
        {showEditModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleEditCancel}
          >
            <div
              className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-md lg:max-w-lg shadow-xl transform transition-all animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  تعديل المستخدم
                </h2>
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition duration-200"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    placeholder="أدخل الاسم"
                    required
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الدور
                  </label>
                  <select
                    name="role"
                    value={editFormData.role}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    <option value="user">مستخدم</option>
                    <option value="admin">مدير</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition duration-200 flex-1 text-sm sm:text-base font-medium"
                  >
                    {editLoading ? "جاري التحديث..." : "تحديث المستخدم"}
                  </button>
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition duration-200 flex-1 text-sm sm:text-base font-medium"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}