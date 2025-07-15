import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { useAuth } from "../context/AuthContext"; // Import useAuth hook

export default function Revenue() {
    const [bills, setBills] = useState([]); // State for all bills (for daily calculations)
    const [totalOverallRevenue, setTotalOverallRevenue] = useState(0); // New state for overall delivered revenue
    const [error, setError] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loadingBills, setLoadingBills] = useState(true); // Loading state for all bills
    const [loadingOverallRevenue, setLoadingOverallRevenue] = useState(true); // Loading state for overall revenue

    const { token, user, dashboardRefreshKey } = useAuth(); // Get token, user, and refreshKey

    // Effect to fetch ALL bills (for daily expected/actual calculations)
    useEffect(() => {
        if (!user || !token) {
            setError("Shopkeeper not found or not authenticated.");
            setLoadingBills(false);
            setBills([]);
            return;
        }

        setLoadingBills(true); // Set loading true before fetch
        setError(""); // Clear previous errors for this fetch

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
                setLoadingBills(false);
            })
            .catch(err => {
                setError(err.message || "Error loading bills for daily calculations");
                setBills([]);
                setLoadingBills(false);
            });
    }, [user, token, dashboardRefreshKey]); // Add dashboardRefreshKey to dependencies

    // Effect to fetch OVERALL DELIVERED REVENUE (from new backend endpoint)
    useEffect(() => {
        if (!user || !token) {
            setLoadingOverallRevenue(false);
            setTotalOverallRevenue(0);
            return;
        }

        setLoadingOverallRevenue(true);
        // No need to clear global error here, as it's specific to this fetch

        fetch(`${process.env.REACT_APP_API_URL}/api/bills/revenue`, { // Call the new revenue endpoint
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(async res => {
                if (!res.ok) {
                    let msg = "Failed to fetch overall revenue";
                    try { msg = (await res.json()).error || msg; } catch { }
                    throw new Error(msg);
                }
                return res.json();
            })
            .then(data => {
                setTotalOverallRevenue(data.total_revenue || 0); // Use the total_revenue field
                setLoadingOverallRevenue(false);
            })
            .catch(err => {
                setError(prev => prev + (prev ? "\n" : "") + (err.message || "Error loading overall revenue")); // Append error
                setTotalOverallRevenue(0);
                setLoadingOverallRevenue(false);
            });
    }, [user, token, dashboardRefreshKey]); // Dependencies for overall revenue fetch

    // MODIFIED: Function to format date consistently to YYYY-MM-DD UTC
    const formatDate = date => {
        const d = new Date(date);
        // Get UTC components to ensure consistency regardless of local timezone
        const year = d.getUTCFullYear();
        const month = (d.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const day = d.getUTCDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayStr = formatDate(new Date());
    const selectedStr = formatDate(selectedDate);

    // Revenue calculations for daily expected/actual (uses 'bills' state)
    const calcRevenue = dateStr => {
        const expected = bills
            .filter(b => formatDate(new Date(b.due_date)) === dateStr) // Ensure due_date is also formatted consistently
            .reduce((sum, b) => sum + parseFloat(b.total_value || 0), 0);
        const actual = bills
            .filter(b => formatDate(new Date(b.delivery_date)) === dateStr && b.status === "Delivered") // Ensure delivery_date is also formatted consistently
            .reduce((sum, b) => sum + parseFloat(b.total_value || 0), 0);
        return { expected, actual };
    };

    const { expected: todayExpected, actual: todayActual } = calcRevenue(todayStr);
    const { expected: selectedExpected, actual: selectedActual } = calcRevenue(selectedStr);

    const isLoading = loadingBills || loadingOverallRevenue; // Combined loading state

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-inter">
            <h2 className="text-3xl font-bold text-indigo-700 mb-6 rounded-md p-3 bg-white shadow-sm">📊 Revenue Dashboard</h2>

            {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6 shadow-md">
                    ❌ {error}
                </div>
            )}

            {isLoading ? (
                <p className="text-gray-600 text-lg p-4 bg-white rounded-lg shadow-md">Loading revenue data...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {/* Overall Delivered Revenue */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg p-6 rounded-lg transform transition-transform duration-300 hover:scale-105">
                        <h3 className="text-xl font-semibold mb-4 flex items-center">
                            <span className="mr-2 text-2xl">💰</span> Total Delivered Revenue
                        </h3>
                        <p className="text-4xl font-bold">₹{totalOverallRevenue.toLocaleString("en-IN")}</p>
                        <p className="text-sm opacity-80 mt-2">Sum of all delivered bills.</p>
                    </div>

                    {/* Today's Revenue Summary */}
                    <div className="bg-white shadow-md p-6 rounded-lg transform transition-transform duration-300 hover:scale-105">
                        <h3 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
                            <span className="mr-2 text-2xl">📅</span> Today's Revenue
                        </h3>
                        <div className="space-y-2 text-lg">
                            <p>🧾 Expected: <span className="font-semibold text-gray-800">₹{todayExpected.toLocaleString("en-IN")}</span></p>
                            <p>✅ Actual: <span className="font-semibold text-gray-800">₹{todayActual.toLocaleString("en-IN")}</span></p>
                        </div>
                    </div>

                    {/* Revenue by Selected Date */}
                    <div className="bg-white shadow-md p-6 rounded-lg col-span-1 md:col-span-2 lg:col-span-1 transform transition-transform duration-300 hover:scale-105">
                        <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                            <span className="mr-2 text-2xl">📆</span> Revenue on Selected Date
                        </h3>
                        <div className="flex flex-col items-center">
                            <Calendar
                                onChange={setSelectedDate}
                                value={selectedDate}
                                className="mb-4 rounded-lg shadow-md border border-gray-200 p-2"
                            />
                            <div className="space-y-2 text-lg w-full text-center">
                                <p>🧾 Expected (due): <span className="font-semibold text-gray-800">₹{selectedExpected.toLocaleString("en-IN")}</span></p>
                                <p>✅ Actual (delivered): <span className="font-semibold text-gray-800">₹{selectedActual.toLocaleString("en-IN")}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
