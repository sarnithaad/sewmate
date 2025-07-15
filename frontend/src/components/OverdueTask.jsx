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
                return `${base} bg-[#EDE7DD] text-[#5C4033]`;
            case "Cut":
                return `${base} bg-[#F0D8B8] text-[#5C4033]`;
            case "Stitched":
                return `${base} bg-[#F7E7CE] text-[#5C4033]`;
            case "Packed":
                return `${base} bg-[#D3C0A6] text-[#3E2C23]`;
            case "Delivered":
                return `${base} bg-[#EAE0D5] text-[#6B4F3B]`;
            default:
                return `${base} bg-[#FBE9E7] text-[#B91C1C]`;
        }
    };

    return (
        <div className="p-6 bg-gradient-to-br from-[#F9F3EB] to-[#F5EBDD] min-h-screen font-inter">
            <h2 className="text-4xl font-extrabold text-[#5C4033] mb-8 rounded-xl p-4 bg-[#FDF6EC] shadow-xl text-center animate-fade-in flex items-center justify-center">
                <img
                    src="https://placehold.co/50x50/D2B48C/ffffff?text=Late"
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
                <p className="text-[#5C4033] text-xl p-6 bg-[#FDF6EC] rounded-lg shadow-lg text-center animate-pulse">
                    Loading overdue tasks...
                </p>
            ) : (
                <div className="overflow-x-auto bg-[#FCF7EF] rounded-xl shadow-xl animate-fade-in-up">
                    {overdue.length === 0 ? (
                        <div className="text-center py-10 text-[#85704D] text-lg">
                            <p>🎉 No overdue tasks found! You're all caught up.</p>
                            <img
                                src="https://placehold.co/150x150/e8e4d8/3b2f2f?text=Clear"
                                alt="No Overdue Icon"
                                className="mx-auto mt-6 rounded-full shadow-md"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/cccccc/333333?text=Error'; }}
                            />
                        </div>
                    ) : (
                        <table className="min-w-full text-sm text-left border-collapse">
                            <thead className="bg-gradient-to-r from-[#F1E6DA] to-[#EADAC4] text-[#3E2C23] uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 border-b-2 border-[#E0CDB5]">Customer</th>
                                    <th className="px-4 py-3 border-b-2 border-[#E0CDB5]">Bill No</th>
                                    <th className="px-4 py-3 border-b-2 border-[#E0CDB5]">Current Status</th>
                                    <th className="px-4 py-3 border-b-2 border-[#E0CDB5]">Due Date</th>
                                    <th className="px-4 py-3 border-b-2 border-[#E0CDB5]">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {overdue.map(bill => (
                                    <tr key={bill.id} className="border-t border-[#D8C3A5] hover:bg-[#FFF7EE] transition-colors duration-200 ease-in-out">
                                        <td className="px-4 py-3">{bill.customer_name}</td>
                                        <td className="px-4 py-3 font-semibold text-[#A0522D]">{bill.bill_number}</td>
                                        <td className="px-4 py-3">
                                            <span className={getStatusStyle(bill.status)}>{bill.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-[#8B0000] font-medium">{bill.due_date}</td>
                                        <td className="px-4 py-3 text-[#3E2C23]">₹{bill.total_value}</td>
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
