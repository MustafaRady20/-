"use client";
import React, { useState, useEffect } from "react";
import { Edit, Save, X } from "lucide-react";

const NAMES = {
  Big: "وحدة كبيرة",
  small: "وحدة صغيرة",
  Electrical: "وحدة كهربائية",
};
const ItemPricingPage = () => {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // رابط API - استبدله برابط الخادم الخاص بك
  const API_BASE = "http://localhost:3000/item-pricing";

  // جلب جميع العناصر
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE);
      if (!response.ok) throw new Error("فشل في جلب العناصر");
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // بدء تعديل العنصر
  const startEdit = (item) => {
    setEditingId(item._id);
    setEditPrice(item.pricePerDay.toString());
  };

  // إلغاء التعديل
  const cancelEdit = () => {
    setEditingId(null);
    setEditPrice("");
  };

  // حفظ السعر الجديد
  const savePrice = async (id) => {
    const priceValue = parseFloat(editPrice);

    // التحقق من صحة السعر
    if (isNaN(priceValue) || priceValue < 0) {
      alert("يرجى إدخال سعر صحيح (0 أو أكبر)");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pricePerDay: priceValue,
        }),
      });

      if (!response.ok) throw new Error("فشل في تحديث السعر");

      // تحديث البيانات المحلية
      setItems(
        items.map((item) =>
          item._id === id ? { ...item, pricePerDay: priceValue } : item
        )
      );

      setEditingId(null);
      setEditPrice("");
    } catch (err) {
      console.error("خطأ في تحديث السعر:", err);
      // للعرض التجريبي، قم بالتحديث محلياً
      setItems(
        items.map((item) =>
          item.id === id ? { ...item, pricePerDay: priceValue } : item
        )
      );
      setEditingId(null);
      setEditPrice("");
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-xl text-gray-600">جاري تحميل العناصر...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* العنوان الرئيسي */}
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">
              تحديث أسعار العناصر
            </h1>
          </div>

          {/* رسالة الخطأ */}
          {error && (
            <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4">
              <div className="text-yellow-700">
                <strong>ملاحظة:</strong> يتم استخدام بيانات تجريبية - {error}
              </div>
            </div>
          )}

          {/* الجدول */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase">
                    نوع العنصر
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase">
                    السعر الحالي (جنيه/يوم)
                  </th>

                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase">
                    العملية
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {NAMES[item.itemType]}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === item._id ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                          autoFocus
                        />
                      ) : (
                        <div className="text-sm text-gray-900 font-mono">
                          {item.pricePerDay.toFixed(2)} جنيه
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      {editingId === item._id ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => savePrice(item._id)}
                            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                            title="حفظ"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
                            title="إلغاء"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(item)}
                          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                          title="تعديل السعر"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* حالة فارغة */}
          {items.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">لا توجد عناصر</div>
            </div>
          )}

          {/* التذييل */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              إجمالي العناصر: {items.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemPricingPage;
