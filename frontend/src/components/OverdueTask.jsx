import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; // Import useAuth hook

export default function OverdueTask() {
    const [overdue, setOverdue] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true); // Add loading state

    const { token, user, dashboardRefreshKey } = useAuth(); // Get token, user, and refreshKey

    useEffect(() => {
        if (!user || !token) {
            setError("Shopkeeper not found or not authenticated.");
            setLoading(false);
            setOverdue([]);
            return;
        }

        setLoading(true); // Set loading true before fetch
        setError(""); // Clear previous errors

        fetch(`${process.env.REACT_APP_API_URL}/api/bills/overdue`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(async res => {
                if (!res.ok) {
                    let msg = "Failed to fetch overdue tasks";
                    try {
                        msg = (await res.json()).error || msg;
                    } catch { }
                    throw new Error(msg);
                }
                return res.json();
            })
            .then(data => {
                setOverdue(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || "Error loading overdue tasks");
                setOverdue([]);
                setLoading(false);
            });
    }, [user, token, dashboardRefreshKey]); // Add dashboardRefreshKey to dependencies

    const getStatusStyle = status => {
        const base = "px-3 py-1 rounded-full text-xs font-semibold"; // Adjusted padding and font-weight
        switch (status) {
            case "Booked":
                return `${base} bg-purple-100 text-purple-800`; // New status style
            case "Cut":
                return `${base} bg-yellow-100 text-yellow-800`;
            case "Stitched":
                return `${base} bg-blue-100 text-blue-800`;
            case "Packed":
                return `${base} bg-green-100 text-green-800`;
            case "Delivered":
                return `${base} bg-gray-200 text-gray-600`;
            default:
                return `${base} bg-red-100 text-red-700`; // Overdue or unknown status
        }
    };

    return (
        <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 min-h-screen font-inter">
            <h2 className="text-4xl font-extrabold text-rose-800 mb-8 rounded-xl p-4 bg-white shadow-xl text-center animate-fade-in flex items-center justify-center">
                <img
                    src="https://placehold.co/50x50/fca5a5/ffffff?text=Overdue"
                    alt="Overdue Tasks Icon"
                    className="h-12 w-12 rounded-full mr-4 shadow-md"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/cccccc/333333?text=Err'; }}
                />
                🚨 Overdue Tasks
            </h2>

            {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6 shadow-md animate-slide-down">
                    ❌ {error}
                </div>
            )}

            {loading ? (
                <p className="text-gray-700 text-xl p-6 bg-white rounded-lg shadow-lg text-center animate-pulse">Loading overdue tasks...</p>
            ) : (
                <div className="overflow-x-auto bg-white rounded-xl shadow-xl animate-fade-in-up">
                    {overdue.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 text-lg">
                            <p>🎉 No overdue tasks found! You're all caught up.</p>
                            <img
                                src="https://placehold.co/150x150/dcfce7/16a34a?text=Clear"
                                alt="No Overdue Icon"
                                className="mx-auto mt-6 rounded-full shadow-md"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/cccccc/333333?text=Error'; }}
                            />
                        </div>
                    ) : (
                        <table className="min-w-full text-sm text-left border-collapse">
                            <thead className="bg-gradient-to-r from-rose-100 to-red-100 text-gray-800 uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 border-b-2 border-rose-200">Customer</th>
                                    <th className="px-4 py-3 border-b-2 border-rose-200">Bill No</th> {/* Added Bill No */}
                                    <th className="px-4 py-3 border-b-2 border-rose-200">Current Status</th>
                                    <th className="px-4 py-3 border-b-2 border-rose-200">Due Date</th>
                                    <th className="px-4 py-3 border-b-2 border-rose-200">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {overdue.map(bill => (
                                    <tr key={bill.id} className="border-t border-gray-200 hover:bg-red-50 transition-colors duration-200 ease-in-out">
                                        <td className="px-4 py-3">{bill.customer_name}</td>
                                        <td className="px-4 py-3 font-semibold text-rose-700">{bill.bill_number}</td> {/* Display bill number */}
                                        <td className="px-4 py-3">
                                            <span className={getStatusStyle(bill.status)}>{bill.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-red-600 font-medium">{bill.due_date}</td>
                                        <td className="px-4 py-3 text-gray-700">₹{bill.total_value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
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
                `}
            </style>
        </div>
    );
}
