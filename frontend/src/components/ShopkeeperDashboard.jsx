import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { useAuth } from "../context/AuthContext"; // Import useAuth hook

export default function ShopkeeperDashboard() {
    const [deliveries, setDeliveries] = useState({ overdue: [], today: [], upcoming: [] });
    const [selectedDateBills, setSelectedDateBills] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { token, dashboardRefreshKey } = useAuth(); // Get token and refreshKey from AuthContext

    // Helper function to format date consistently to YYYY-MM-DD UTC
    const formatDateToUTC = date => {
        const d = new Date(date);
        // Get UTC components to ensure consistency regardless of local timezone
        const year = d.getUTCFullYear();
        const month = (d.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const day = d.getUTCDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Fetch dashboard deliveries
    useEffect(() => {
        if (!token) {
            setError("Unauthorized: No token found");
            setLoading(false);
            return;
        }

        setLoading(true); // Set loading true on every fetch attempt
        setError(""); // Clear previous errors

        fetch(`${process.env.REACT_APP_API_URL}/api/bills/dashboard-deliveries`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(async res => {
                let data;
                try {
                    data = await res.json();
                } catch {
                    throw new Error("Invalid response from server");
                }
                if (!res.ok) throw new Error(data.error || "Failed to fetch deliveries");
                setDeliveries(data);
            })
            .catch(err => {
                setError(err.message || "Error fetching delivery dashboard");
                setDeliveries({ overdue: [], today: [], upcoming: [] });
            })
            .finally(() => {
                setLoading(false); // Set loading false after fetch completes (success or error)
            });
    }, [token, dashboardRefreshKey]); // Add dashboardRefreshKey to dependencies

    // Fetch bills for selected date
    useEffect(() => {
        if (!token || !selectedDate) { // Ensure selectedDate is not null
            setSelectedDateBills([]);
            return;
        }

        setError(""); // Clear previous errors for date-specific fetch
        // Use the new formatDateToUTC function
        const dateStr = formatDateToUTC(selectedDate);
        
        fetch(`${process.env.REACT_APP_API_URL}/api/bills/by-date/${dateStr}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(async res => {
                let data;
                try {
                    data = await res.json();
                } catch {
                    throw new Error("Invalid response fetching date-specific bills");
                }
                if (!res.ok) throw new Error(data.error || "Failed to fetch bills for date");
                // Backend returns { bills: [...] }, so access data.bills
                setSelectedDateBills(Array.isArray(data.bills) ? data.bills : []);
            })
            .catch(err => {
                console.error("Error fetching date-specific bills:", err); // Log the error
                setSelectedDateBills([]);
                setError(prev => prev + (prev ? " | " : "") + "Error fetching bills for date."); // Append error
            });
    }, [selectedDate, token, dashboardRefreshKey]); // Add dashboardRefreshKey to dependencies

    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen font-inter">
            <h2 className="text-4xl font-extrabold text-blue-800 mb-8 rounded-xl p-4 bg-white shadow-xl text-center animate-fade-in flex items-center justify-center">
                <img
                    src="https://placehold.co/50x50/60a5fa/ffffff?text=Dash"
                    alt="Dashboard Icon"
                    className="h-12 w-12 rounded-full mr-4 shadow-md"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/cccccc/333333?text=Err'; }}
                />
                🚚 Delivery Dashboard
            </h2>

            {loading ? (
                <p className="text-gray-700 text-xl p-6 bg-white rounded-lg shadow-lg text-center animate-pulse">Loading dashboard...</p>
            ) : (
                <>
                    {error && (
                        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6 shadow-md animate-slide-down">
                            ❌ {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <DeliveryList title="🚨 Overdue Deliveries" bills={deliveries.overdue} color="red" />
                        <DeliveryList title="📦 Today's Deliveries" bills={deliveries.today} color="green" />
                        <DeliveryList title="📅 Upcoming (Next 2 Days)" bills={deliveries.upcoming} color="blue" />
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-xl mt-8 animate-fade-in-up">
                        <h3 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center justify-center">
                            <img
                                src="https://placehold.co/40x40/818cf8/ffffff?text=Date"
                                alt="Calendar Icon"
                                className="h-10 w-10 rounded-full mr-3 shadow-sm"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/cccccc/333333?text=Err'; }}
                            />
                            📌 View Deliveries by Date
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex justify-center items-start">
                                <Calendar
                                    onChange={setSelectedDate}
                                    value={selectedDate}
                                    className="rounded-xl shadow-lg border border-gray-300 p-3 w-full max-w-xs"
                                />
                            </div>
                            <div>
                                <h4 className="text-xl font-semibold mb-4 text-gray-800 text-center">
                                    Deliveries on {selectedDate.toDateString()}:
                                </h4>
                                {selectedDateBills.length === 0 ? (
                                    <div className="text-center py-6 text-gray-500 italic">
                                        <p>No deliveries for this date.</p>
                                        <img
                                            src="https://placehold.co/100x100/f0f9ff/3b82f6?text=Empty"
                                            alt="No Deliveries Icon"
                                            className="mx-auto mt-4 rounded-full shadow-sm"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/cccccc/333333?text=Error'; }}
                                        />
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow-md p-4">
                                        {selectedDateBills.map(bill => (
                                            <li key={bill.id} className="py-3 flex justify-between items-center animate-fade-in-item">
                                                <div>
                                                    <div className="font-bold text-gray-900">{bill.customer_name}</div>
                                                    <div className="text-sm text-gray-600">Bill No: <span className="font-medium">{bill.bill_number}</span></div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-700">Due: <span className="font-medium">{bill.due_date}</span></div>
                                                    <div className="text-md font-semibold text-green-600">₹{bill.total_value}</div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
            {/* Basic CSS for animations (can be moved to index.css or a dedicated styles file) */}
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
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInItem {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.7s ease-out forwards;
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
                .animate-fade-in-item {
                    animation: fadeInItem 0.5s ease-out forwards;
                }
                `}
            </style>
        </div>
    );
}

function DeliveryList({ title, bills, color }) {
    const bgColor = {
        red: "bg-red-50 border-red-500 text-red-700",
        green: "bg-green-50 border-green-500 text-green-700",
        blue: "bg-blue-50 border-blue-500 text-blue-700"
    }[color];

    const icon = {
        red: "🚨",
        green: "📦",
        blue: "📅"
    }[color];

    return (
        <div className={`border-l-4 p-6 rounded-xl shadow-lg transform transition-transform duration-300 hover:scale-105 ${bgColor} animate-fade-in-up`}>
            <h3 className="font-bold text-xl mb-4 flex items-center">
                <span className="mr-2 text-2xl">{icon}</span> {title}
            </h3>
            {bills.length === 0 ? (
                <div className="text-gray-500 italic text-center py-4">
                    <p>No deliveries</p>
                    <img
                        src={`https://placehold.co/100x100/${color === 'red' ? 'fca5a5' : color === 'green' ? 'dcfce7' : 'e0f2f7'}/${color === 'red' ? 'dc2626' : color === 'green' ? '16a34a' : '2563eb'}?text=Empty`}
                        alt="No Deliveries Icon"
                        className="mx-auto mt-4 rounded-full shadow-sm"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/cccccc/333333?text=Error'; }}
                    />
                </div>
            ) : (
                <ul className="space-y-3">
                    {bills.map(bill => (
                        <li key={bill.id} className="border-b border-gray-200 pb-3 text-base animate-fade-in-item">
                            <div className="font-semibold text-gray-900">{bill.customer_name}</div>
                            <div className="text-sm text-gray-700">Bill No: <span className="font-medium">{bill.bill_number}</span></div>
                            <div className="text-sm text-gray-700">Due: <span className="font-medium">{bill.due_date}</span></div>
                            <div className="text-md font-semibold text-green-600">Value: ₹{bill.total_value}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
