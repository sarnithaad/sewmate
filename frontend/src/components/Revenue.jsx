import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { useAuth } from "../context/AuthContext"; // Import useAuth hook

export default function Revenue() {
    const [bills, setBills] = useState([]);
    const [error, setError] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true); // Add loading state

    const { token, user, dashboardRefreshKey } = useAuth(); // Get token, user, and refreshKey

    useEffect(() => {
        if (!user || !token) {
            setError("Shopkeeper not found or not authenticated.");
            setLoading(false);
            setBills([]);
            return;
        }

        setLoading(true); // Set loading true before fetch
        setError(""); // Clear previous errors

        fetch(`${process.env.REACT_APP_API_URL}/api/bills`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(async res => {
                if (!res.ok) {
                    let msg = "Failed to fetch bills";
                    try { msg = (await res.json()).error || msg; } catch { }
                    throw new Error(msg);
                }
                return res.json();
            })
            .then(data => {
                setBills(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || "Error loading revenue");
                setBills([]);
                setLoading(false);
            });
    }, [user, token, dashboardRefreshKey]); // Add dashboardRefreshKey to dependencies

    const formatDate = date => date.toISOString().split("T")[0];

    const todayStr = formatDate(new Date());
    const selectedStr = formatDate(selectedDate);

    // Revenue calculations
    const calcRevenue = dateStr => {
        const expected = bills
            .filter(b => b.due_date === dateStr)
            .reduce((sum, b) => sum + parseFloat(b.total_value || 0), 0);
        const actual = bills
            .filter(b => b.delivery_date === dateStr && b.status === "Delivered")
            .reduce((sum, b) => sum + parseFloat(b.total_value || 0), 0);
        return { expected, actual };
    };

    const { expected: todayExpected, actual: todayActual } = calcRevenue(todayStr);
    const { expected: selectedExpected, actual: selectedActual } = calcRevenue(selectedStr);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-bold text-indigo-700 mb-6">Revenue Dashboard</h2>

            {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded mb-4">
                    ❌ {error}
                </div>
            )}

            {loading ? (
                <p className="text-gray-600">Loading revenue data...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {/* Today's Revenue Summary */}
                    <div className="bg-white shadow-md p-6 rounded-lg">
                        <h3 className="text-xl font-semibold text-green-700 mb-4">📅 Today's Revenue</h3>
                        <div className="space-y-2 text-lg">
                            <p>🧾 Expected: <span className="font-semibold text-gray-800">₹{todayExpected.toLocaleString("en-IN")}</span></p>
                            <p>✅ Actual: <span className="font-semibold text-gray-800">₹{todayActual.toLocaleString("en-IN")}</span></p>
                        </div>
                    </div>

                    {/* Revenue by Selected Date */}
                    <div className="bg-white shadow-md p-6 rounded-lg">
                        <h3 className="text-xl font-semibold text-blue-700 mb-4">📆 Revenue on Selected Date</h3>
                        <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                            className="mb-4 rounded shadow-md"
                        />
                        <div className="space-y-2 text-lg">
                            <p>🧾 Expected (due): <span className="font-semibold text-gray-800">₹{selectedExpected.toLocaleString("en-IN")}</span></p>
                            <p>✅ Actual (delivered): <span className="font-semibold text-gray-800">₹{selectedActual.toLocaleString("en-IN")}</span></p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
