import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function OverdueTask() {
    const [overdue, setOverdue] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const { token, user, dashboardRefreshKey } = useAuth();

    useEffect(() => {
        if (!user || !token) {
            setError("Shopkeeper not found or not authenticated.");
            setLoading(false);
            setOverdue([]);
            return;
        }

        setLoading(true);
        setError("");

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
    }, [user, token, dashboardRefreshKey]);

    const getStatusStyle = status => {
        const base = "px-3 py-1 rounded-full text-xs font-semibold";
        switch (status) {
            case "Booked":
                return `${base} bg-[#F2E5E8] text-[#754F4F]`;
            case "Cut":
                return `${base} bg-[#EBE0E2] text-[#754F4F]`;
            case "Stitched":
                return `${base} bg-[#F9E9EC] text-[#754F4F]`;
            case "Packed":
                return `${base} bg-[#E0C0C6] text-[#5A3F44]`;
            case "Delivered":
                return `${base} bg-[#F2D7DD] text-[#8C6B71]`;
            default:
                return `${base} bg-[#FBE9E7] text-[#B91C1C]`; // Existing red for 'default' or unknown status
        }
    };

    return (
        <div className="p-6 bg-gradient-to-br from-[#FDF0F3] to-[#F2E5E8] min-h-screen font-inter">
            <h2 className="text-4xl font-extrabold text-[#754F4F] mb-8 rounded-xl p-4 bg-white shadow-xl text-center animate-fade-in flex items-center justify-center">
                <img
                    src="https://placehold.co/50x50/D1A6AD/ffffff?text=Late" // Updated for contrast
                    alt="Overdue Tasks Icon"
                    className="h-12 w-12 rounded-full mr-4 shadow-md"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/cccccc/333333?text=Err'; }}
                />
                ⚠️ Overdue Tasks
            </h2>

            {error && (
                <div className="bg-[#FEE2E2] border border-[#FCA5A5] text-[#B91C1C] p-4 rounded-lg mb-6 shadow-md animate-slide-down">
                    ❌ {error}
                </div>
            )}

            {loading ? (
                <p className="text-[#754F4F] text-xl p-6 bg-white rounded-lg shadow-lg text-center animate-pulse">
                    Loading overdue tasks...
                </p>
            ) : (
                <div className="overflow-x-auto bg-white rounded-xl shadow-xl animate-fade-in-up">
                    {overdue.length === 0 ? (
                        <div className="text-center py-10 text-[#AD8B8B] text-lg">
                            <p>🎉 No overdue tasks found! You're all caught up.</p>
                            <img
                                src="https://placehold.co/150x150/F9E9EC/AD8B8B?text=Clear" // Updated for palette
                                alt="No Overdue Icon"
                                className="mx-auto mt-6 rounded-full shadow-md"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/cccccc/333333?text=Error'; }}
                            />
                        </div>
                    ) : (
                        <table className="min-w-full text-sm text-left border-collapse">
                            <thead className="bg-gradient-to-r from-[#F2E5E8] to-[#EBE0E2] text-[#5A3F44] uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 border-b-2 border-[#E0C0C6]">Customer</th>
                                    <th className="px-4 py-3 border-b-2 border-[#E0C0C6]">Bill No</th>
                                    <th className="px-4 py-3 border-b-2 border-[#E0C0C6]">Current Status</th>
                                    <th className="px-4 py-3 border-b-2 border-[#E0C0C6]">Due Date</th>
                                    <th className="px-4 py-3 border-b-2 border-[#E0C0C6]">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {overdue.map(bill => (
                                    <tr key={bill.id} className="border-t border-[#E0C0C6] hover:bg-[#FFF7F9] transition-colors duration-200 ease-in-out">
                                        <td className="px-4 py-3">{bill.customer_name}</td>
                                        <td className="px-4 py-3 font-semibold text-[#D1A6AD]">{bill.bill_number}</td>
                                        <td className="px-4 py-3">
                                            <span className={getStatusStyle(bill.status)}>{bill.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-[#B91C1C] font-medium">{bill.due_date}</td> {/* Keep red for overdue date */}
                                        <td className="px-4 py-3 text-[#5A3F44]">₹{bill.total_value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
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
