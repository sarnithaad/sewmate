import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { useAuth } from "../context/AuthContext";

export default function Revenue() {
    const [bills, setBills] = useState([]);
    const [totalOverallRevenue, setTotalOverallRevenue] = useState(0);
    const [error, setError] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loadingBills, setLoadingBills] = useState(true);
    const [loadingOverallRevenue, setLoadingOverallRevenue] = useState(true);

    const { token, user, dashboardRefreshKey } = useAuth();

    useEffect(() => {
        if (!user || !token) {
            setError("Shopkeeper not found or not authenticated.");
            setLoadingBills(false);
            setBills([]);
            return;
        }

        setLoadingBills(true);
        setError("");

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
    }, [user, token, dashboardRefreshKey]);

    useEffect(() => {
        if (!user || !token) {
            setLoadingOverallRevenue(false);
            setTotalOverallRevenue(0);
            return;
        }

        setLoadingOverallRevenue(true);

        fetch(`${process.env.REACT_APP_API_URL}/api/bills/revenue`, {
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
                setTotalOverallRevenue(data.total_revenue || 0);
                setLoadingOverallRevenue(false);
            })
            .catch(err => {
                setError(prev => prev + (prev ? "\n" : "") + (err.message || "Error loading overall revenue"));
                setTotalOverallRevenue(0);
                setLoadingOverallRevenue(false);
            });
    }, [user, token, dashboardRefreshKey]);

    const formatDate = date => {
        const d = new Date(date);
        const year = d.getUTCFullYear();
        const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = d.getUTCDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayStr = formatDate(new Date());
    const selectedStr = formatDate(selectedDate);

    const calcRevenue = dateStr => {
        const expected = bills
            .filter(b => formatDate(new Date(b.due_date)) === dateStr)
            .reduce((sum, b) => sum + parseFloat(b.total_value || 0), 0);
        const actual = bills
            .filter(b => formatDate(new Date(b.delivery_date)) === dateStr && b.status === "Delivered")
            .reduce((sum, b) => sum + parseFloat(b.total_value || 0), 0);
        return { expected, actual };
    };

    const { expected: todayExpected, actual: todayActual } = calcRevenue(todayStr);
    const { expected: selectedExpected, actual: selectedActual } = calcRevenue(selectedStr);
    const isLoading = loadingBills || loadingOverallRevenue;

    return (
        <div className="p-6 bg-gradient-to-br from-[#FDF0F3] to-[#F2E5E8] min-h-screen font-inter">
            <h2 className="text-4xl font-extrabold text-[#754F4F] mb-8 rounded-xl p-4 bg-white shadow-xl text-center animate-fade-in">
                <span className="mr-3">📈</span> Revenue Dashboard
            </h2>

            {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6 shadow-md animate-slide-down">
                    ❌ {error}
                </div>
            )}

            {isLoading ? (
                <p className="text-[#754F4F] text-xl p-6 bg-white rounded-lg shadow-lg text-center animate-pulse">
                    Loading revenue data...
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {/* Total Delivered Revenue */}
                    <div className="bg-gradient-to-br from-[#D1A6AD] to-[#C2949D] text-white shadow-xl p-8 rounded-xl flex flex-col items-center justify-center transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                        <img
                            src="https://placehold.co/100x100/ffffff/D1A6AD?text=Total"
                            alt="Total Revenue Icon"
                            className="mb-4 rounded-full border-4 border-white shadow-lg"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/cccccc/333333?text=Error'; }}
                        />
                        <h3 className="text-2xl font-bold mb-2 flex items-center">
                            <span className="mr-2 text-3xl">💰</span> Total Delivered Revenue
                        </h3>
                        <p className="text-5xl font-extrabold">₹{totalOverallRevenue.toLocaleString("en-IN")}</p>
                        <p className="text-sm opacity-90 mt-3 text-center">Based on {bills.length} bills delivered.</p>
                    </div>

                    {/* Today's Revenue */}
                    <div className="bg-white shadow-xl p-8 rounded-xl flex flex-col items-center justify-center transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                        <img
                            src="https://placehold.co/100x100/F2E5E8/754F4F?text=Today" 
                            alt="Today's Revenue Icon"
                            className="mb-4 rounded-full border-4 border-[#D1A6AD] shadow-lg" 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/cccccc/333333?text=Error'; }}
                        />
                        <h3 className="text-2xl font-semibold text-[#754F4F] mb-4 flex items-center">
                            <span className="mr-2 text-3xl">📅</span> Today's Revenue
                        </h3>
                        <div className="space-y-3 text-xl text-center">
                            <p>🧾 Expected: <span className="font-bold text-[#5A3F44]">₹{todayExpected.toLocaleString("en-IN")}</span></p>
                            <p>✅ Actual: <span className="font-bold text-[#5A3F44]">₹{todayActual.toLocaleString("en-IN")}</span></p>
                        </div>
                    </div>

                    {/* Revenue by Selected Date */}
                    <div className="bg-white shadow-xl p-8 rounded-xl col-span-1 md:col-span-2 lg:col-span-1 flex flex-col items-center transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                        <img
                            src="https://placehold.co/100x100/F9E9EC/AD8B8B?text=Select" 
                            alt="Select Date Icon"
                            className="mb-4 rounded-full border-4 border-[#C2949D] shadow-lg" 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/cccccc/333333?text=Error'; }}
                        />
                        <h3 className="text-2xl font-semibold text-[#754F4F] mb-6 flex items-center">
                            <span className="mr-2 text-3xl">📆</span> Revenue on Selected Date
                        </h3>
                        <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                            tileClassName={({ date }) =>
                                formatDate(date) === todayStr ? "bg-[#FBE9EC] font-bold text-[#AD8B8B] rounded-lg" : "" 
                            }
                            className="mb-6 rounded-lg shadow-lg border border-[#E0C0C6] p-3 w-full max-w-xs" 
                        />
                        <div className="space-y-3 text-xl w-full text-center">
                            <p>🧾 Expected (due): <span className="font-bold text-[#5A3F44]">₹{selectedExpected.toLocaleString("en-IN")}</span></p>
                            <p>✅ Actual (delivered): <span className="font-bold text-[#5A3F44]">₹{selectedActual.toLocaleString("en-IN")}</span></p>
                        </div>
                    </div>
                </div>
            )}

            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                .animate-slide-down {
                    animation: slideDown 0.5s ease-out forwards;
                }
                .animate-pulse {
                    animation: pulse 1.5s infinite ease-in-out;
                }
                `}
            </style>
        </div>
    );
}
