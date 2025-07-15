import React, { useEffect, useState } from "react";
import StatusDropdown from "./Shared/StatusDropdown";
import { useAuth } from "../context/AuthContext"; // Import useAuth hook

export default function BillStatus({ onStatusUpdated }) { // Accept onStatusUpdated prop
    const [bills, setBills] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true); // Add loading state

    const { token, user } = useAuth(); // Get token and user from AuthContext

    useEffect(() => {
        if (!user || !token) {
            setError("Shopkeeper not found or not authenticated.");
            setLoading(false);
            setBills([]); // Clear bills if not authenticated
            return;
        }

        setLoading(true); // Set loading true before fetch
        setError(""); // Clear previous errors

        fetch(`${process.env.REACT_APP_API_URL}/api/bills`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(async res => {
                if (!res.ok) {
                    let msg = "Failed to fetch bills";
                    try {
                        msg = (await res.json()).error || msg;
                    } catch { }
                    throw new Error(msg);
                }
                return res.json();
            })
            .then(data => {
                // Filter out 'Delivered' bills from the initial fetch for this view
                setBills(data.filter(bill => bill.status !== 'Delivered'));
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || "Error loading bills");
                setBills([]);
                setLoading(false);
            });
    }, [user, token]); // Depend on user and token

    const handleStatusChange = async (billId, newStatus) => {
        const status_date = new Date().toISOString().slice(0, 10);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bills/status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` // Ensure token is sent
                },
                body: JSON.stringify({ bill_id: billId, status: newStatus, status_date })
            });

            if (!res.ok) {
                let msg = "Failed to update status";
                try {
                    msg = (await res.json()).error || msg;
                } catch { }
                throw new Error(msg);
            }

            // If delivered, remove bill from the current list
            if (newStatus === "Delivered") {
                setBills(prev => prev.filter(b => b.id !== billId));
            } else {
                // Update the status in the local state
                setBills(prev =>
                    prev.map(b =>
                        b.id === billId ? { ...b, status: newStatus, status_date } : b
                    )
                );
            }
            setError(""); // Clear any previous errors on success

            // Trigger dashboard refresh after successful status update
            if (onStatusUpdated) {
                onStatusUpdated();
            }

        } catch (err) {
            console.error("Status update error:", err); // Log the actual error
            setError(err.message || "Error updating status");
        }
    };

    return (
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen font-inter">
            <h2 className="text-4xl font-extrabold text-indigo-800 mb-8 rounded-xl p-4 bg-white shadow-xl text-center animate-fade-in flex items-center justify-center">
                <img
                    src="https://placehold.co/50x50/818cf8/ffffff?text=Status"
                    alt="Bill Status Icon"
                    className="h-12 w-12 rounded-full mr-4 shadow-md"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/cccccc/333333?text=Err'; }}
                />
                📋 Bill Status
            </h2>

            {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6 shadow-md animate-slide-down">
                    ❌ {error}
                </div>
            )}

            {loading ? (
                <p className="text-gray-700 text-xl p-6 bg-white rounded-lg shadow-lg text-center animate-pulse">Loading bills...</p>
            ) : (
                <div className="overflow-x-auto bg-white rounded-xl shadow-xl animate-fade-in-up">
                    {bills.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 text-lg">
                            <p>🎉 No active bills to display. All caught up!</p>
                            <img
                                src="https://placehold.co/150x150/e0ffe0/006400?text=Done"
                                alt="No Bills Icon"
                                className="mx-auto mt-6 rounded-full shadow-md"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/cccccc/333333?text=Error'; }}
                            />
                        </div>
                    ) : (
                        <table className="min-w-full text-sm text-left border-collapse">
                            <thead className="bg-gradient-to-r from-indigo-100 to-blue-100 text-gray-700 uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 border-b-2 border-indigo-200">Customer</th>
                                    <th className="px-4 py-3 border-b-2 border-indigo-200">Bill No</th>
                                    <th className="px-4 py-3 border-b-2 border-indigo-200">Status</th>
                                    <th className="px-4 py-3 border-b-2 border-indigo-200">Status Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map(bill => (
                                    <tr key={bill.id} className="border-t border-gray-200 hover:bg-blue-50 transition-colors duration-200 ease-in-out">
                                        <td className="px-4 py-3">{bill.customer_name}</td>
                                        <td className="px-4 py-3 font-semibold text-blue-700">{bill.bill_number}</td> {/* Display bill number */}
                                        <td className="px-4 py-3">
                                            <StatusDropdown
                                                value={bill.status}
                                                onChange={status => handleStatusChange(bill.id, status)}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{bill.status_date || "-"}</td>
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
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                .animate-slide-down {
                    animation: slideDown 0.5s ease-out forwards;
                }
                .animate-pulse {
                    animation: pulse 1.5s infinite ease-in-out;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.7s ease-out forwards;
                }
                `}
            </style>
        </div>
    );
}
