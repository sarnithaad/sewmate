import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { useAuth } from "../context/AuthContext";

export default function ShopkeeperDashboard() {
    const [deliveries, setDeliveries] = useState({ overdue: [], today: [], upcoming: [] });
    const [selectedDateBills, setSelectedDateBills] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { token, dashboardRefreshKey } = useAuth();

    const formatDateToUTC = (date) => {
        const d = new Date(date);
        const year = d.getUTCFullYear();
        const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = d.getUTCDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayStr = formatDateToUTC(new Date());

    useEffect(() => {
        if (!token) {
            setError("Unauthorized: No token found");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        fetch(`${process.env.REACT_APP_API_URL}/api/bills/dashboard-deliveries`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(async res => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to fetch deliveries");
                setDeliveries(data);
            })
            .catch(err => {
                setError(err.message || "Error fetching delivery dashboard");
                setDeliveries({ overdue: [], today: [], upcoming: [] });
            })
            .finally(() => setLoading(false));
    }, [token, dashboardRefreshKey]);

    useEffect(() => {
        if (!token || !selectedDate) {
            setSelectedDateBills([]);
            return;
        }

        setError("");
        const dateStr = formatDateToUTC(selectedDate);

        fetch(`${process.env.REACT_APP_API_URL}/api/bills/by-date/${dateStr}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(async res => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to fetch bills for date");
                setSelectedDateBills(Array.isArray(data.bills) ? data.bills : []);
            })
            .catch(err => {
                console.error("Error fetching date-specific bills:", err);
                setSelectedDateBills([]);
                setError(prev => prev + (prev ? " | " : "") + "Error fetching bills for date.");
            });
    }, [selectedDate, token, dashboardRefreshKey]);

    return (
        <div className="p-6 bg-beige min-h-screen font-inter text-richbrown">
            <h2 className="text-4xl font-extrabold mb-8 rounded-xl p-4 bg-brown text-white shadow-xl text-center animate-fade-in">
                🚚 Delivery Dashboard
            </h2>

            {loading ? (
                <p className="text-black text-xl p-6 bg-lighttan rounded-lg shadow-lg text-center animate-pulse">
                    Loading dashboard...
                </p>
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

                    <div className="bg-lighttan p-8 rounded-xl shadow-xl mt-8 animate-fade-in-up">
                        <h3 className="text-2xl font-bold mb-6 text-center">📌 View Deliveries by Date</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex justify-center">
                                <Calendar
                                    onChange={setSelectedDate}
                                    value={selectedDate}
                                    tileClassName={({ date }) =>
                                        formatDateToUTC(date) === todayStr ? "bg-yellow-100 font-bold text-yellow-800 rounded-md" : ""
                                    }
                                    className="rounded-xl shadow-lg border border-gray-300 p-3 w-full max-w-xs"
                                />
                            </div>
                            <div>
                                <h4 className="text-xl font-semibold mb-4 text-center">
                                    Deliveries on {selectedDate.toDateString()}:
                                </h4>
                                {selectedDateBills.length === 0 ? (
                                    <div className="text-center py-6 text-gray-500 italic">
                                        <p>No deliveries for this date.</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow-md p-4">
                                        {selectedDateBills.map(bill => (
                                            <li key={bill.id} className="py-3 flex justify-between items-center animate-fade-in-item">
                                                <div>
                                                    <div className="font-bold">{bill.customer_name}</div>
                                                    <div className="text-sm text-gray-700">Bill No: <span className="font-medium">{bill.bill_number}</span></div>
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

            <style>
                {`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInItem { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }

                .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
                .animate-slide-down { animation: slideDown 0.5s ease-out forwards; }
                .animate-pulse { animation: pulse 1.5s infinite ease-in-out; }
                .animate-fade-in-up { animation: fadeInUp 0.7s ease-out forwards; }
                .animate-fade-in-item { animation: fadeInItem 0.5s ease-out forwards; }
                `}
            </style>
        </div>
    );
}

function DeliveryList({ title, bills, color }) {
    const colors = {
        red: { bg: "bg-red-100", text: "text-red-800", border: "border-red-500" },
        green: { bg: "bg-green-100", text: "text-green-800", border: "border-green-500" },
        blue: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-500" }
    }[color];

    return (
        <div className={`border-l-4 p-6 rounded-xl shadow-lg ${colors.bg} ${colors.text} ${colors.border} animate-fade-in-up`}>
            <h3 className="font-bold text-xl mb-4">{title}</h3>
            {bills.length === 0 ? (
                <div className="text-gray-500 italic text-center">No deliveries</div>
            ) : (
                <ul className="space-y-3">
                    {bills.map(bill => (
                        <li key={bill.id} className="border-b border-gray-200 pb-3 text-base animate-fade-in-item">
                            <div className="font-semibold text-black">{bill.customer_name}</div>
                            <div className="text-sm text-gray-700">Bill No: <span className="font-medium">{bill.bill_number}</span></div>
                            <div className="text-sm text-gray-700">Due: <span className="font-medium">{bill.due_date}</span></div>
                            <div className="text-md font-semibold text-green-700">Value: ₹{bill.total_value}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
