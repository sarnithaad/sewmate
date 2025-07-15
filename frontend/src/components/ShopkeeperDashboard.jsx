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
        // MODIFIED: Use the new formatDateToUTC function
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

    if (loading) return <div className="p-6 text-lg">Loading dashboard...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-inter">
            <h2 className="text-3xl font-bold text-blue-700 mb-6 rounded-md p-3 bg-white shadow-sm">🚚 Delivery Dashboard</h2>

            {error && (
                <div className="mb-4 text-red-700 bg-red-100 border border-red-300 p-3 rounded-lg shadow-md">
                    ❌ {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <DeliveryList title="🚨 Overdue Deliveries" bills={deliveries.overdue} color="red" />
                <DeliveryList title="📦 Today's Deliveries" bills={deliveries.today} color="green" />
                <DeliveryList title="📅 Upcoming (Next 2 Days)" bills={deliveries.upcoming} color="blue" />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mt-8">
                <h3 className="text-xl font-semibold mb-4 text-indigo-600">📌 View Deliveries by Date</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Calendar
                        onChange={setSelectedDate}
                        value={selectedDate}
                        className="rounded-lg shadow-md border border-gray-200 p-2"
                    />
                    <div>
                        <h4 className="text-lg font-semibold mb-2 text-gray-700">
                            Deliveries on {selectedDate.toDateString()}:
                        </h4>
                        {selectedDateBills.length === 0 ? (
                            <p className="text-gray-500">No deliveries for this date.</p>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {selectedDateBills.map(bill => (
                                    <li key={bill.id} className="py-2">
                                        <div className="font-medium">{bill.customer_name} (Bill No: {bill.bill_number})</div> {/* Added Bill No */}
                                        <div className="text-sm text-gray-600">Value: ₹{bill.total_value}</div>
                                        <div className="text-sm text-gray-600">Due: {bill.due_date}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DeliveryList({ title, bills, color }) {
    const bgColor = {
        red: "bg-red-50 border-red-500 text-red-700",
        green: "bg-green-50 border-green-500 text-green-700",
        blue: "bg-blue-50 border-blue-500 text-blue-700"
    }[color];

    return (
        <div className={`border-l-4 p-4 rounded-lg shadow-sm transform transition-transform duration-300 hover:scale-105 ${bgColor}`}>
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            {bills.length === 0 ? (
                <p className="text-gray-500">No deliveries</p>
            ) : (
                <ul className="space-y-2">
                    {bills.map(bill => (
                        <li key={bill.id} className="border-b pb-1 text-sm">
                            <div className="font-semibold">{bill.customer_name} (Bill No: {bill.bill_number})</div> {/* Added Bill No */}
                            <div>Due: {bill.due_date}</div>
                            <div>Value: ₹{bill.total_value}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
