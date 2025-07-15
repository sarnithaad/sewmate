import React, { useEffect, useState } from "react";
import StatusDropdown from "./Shared/StatusDropdown";
import { useAuth } from "../context/AuthContext";

export default function BillStatus({ onStatusUpdated }) {
    const [bills, setBills] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const { token, user } = useAuth();

    useEffect(() => {
        if (!user || !token) {
            setError("🛑 Not authenticated. Please log in.");
            setBills([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        fetch(`${process.env.REACT_APP_API_URL}/api/bills`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async res => {
                if (!res.ok) {
                    const msg = (await res.json()).error || "Failed to fetch bills";
                    throw new Error(msg);
                }
                return res.json();
            })
            .then(data => {
                setBills(data.filter(bill => bill.status !== 'Delivered'));
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || "Error loading bills");
                setBills([]);
                setLoading(false);
            });
    }, [user, token]);

    const handleStatusChange = async (billId, newStatus) => {
        const status_date = new Date().toISOString().slice(0, 10);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/bills/status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ bill_id: billId, status: newStatus, status_date })
            });

            if (!res.ok) {
                const msg = (await res.json()).error || "Failed to update status";
                throw new Error(msg);
            }

            setBills(prev =>
                newStatus === "Delivered"
                    ? prev.filter(b => b.id !== billId)
                    : prev.map(b => (b.id === billId ? { ...b, status: newStatus, status_date } : b))
            );

            setError("");
            onStatusUpdated?.();
        } catch (err) {
            console.error("Status update error:", err);
            setError(err.message || "Error updating status");
        }
    };

    return (
        <div className="p-6 bg-gradient-to-br from-[#FDF6EC] to-[#D2B48C] min-h-screen font-inter">
            <div className="flex items-center justify-center mb-8 animate-fade-in">
                <img
                    src="https://placehold.co/60x60/5C4033/ffffff?text=📋"
                    alt="Status Icon"
                    className="h-14 w-14 rounded-full shadow-lg mr-4"
                    onError={(e) => { e.target.src = 'https://placehold.co/60x60/cccccc/333333?text=Err'; }}
                />
                <h2 className="text-3xl font-extrabold text-[#5C4033]">Bill Status Tracker</h2>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6 shadow-md animate-slide-down">
                    ❌ {error}
                </div>
            )}

            {loading ? (
                <div className="text-center bg-white p-6 rounded-lg shadow animate-pulse text-gray-600 text-lg">
                    🔄 Loading bills...
                </div>
            ) : bills.length === 0 ? (
                <div className="text-center py-10 text-[#5C4033]">
                    <p className="text-xl">🎉 No active bills. You're all caught up!</p>
                    <img
                        src="https://placehold.co/150x150/fdf6ec/5C4033?text=Done"
                        alt="Done Icon"
                        className="mx-auto mt-6 rounded-full shadow"
                        onError={(e) => { e.target.src = 'https://placehold.co/150x150/cccccc/333333?text=Done'; }}
                    />
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-xl shadow-xl animate-fade-in-up">
                    <table className="min-w-full text-sm border-collapse">
                        <thead className="bg-[#D2B48C] text-[#5C4033] uppercase tracking-wide text-left text-xs">
                            <tr>
                                <th className="px-5 py-3 border-b">Customer</th>
                                <th className="px-5 py-3 border-b">Bill No</th>
                                <th className="px-5 py-3 border-b">Status</th>
                                <th className="px-5 py-3 border-b">Status Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map(bill => (
                                <tr
                                    key={bill.id}
                                    className="border-t hover:bg-[#FDF6EC] transition duration-200 ease-in-out"
                                >
                                    <td className="px-5 py-3">{bill.customer_name}</td>
                                    <td className="px-5 py-3 font-semibold text-[#5C4033]">{bill.bill_number}</td>
                                    <td className="px-5 py-3">
                                        <StatusDropdown
                                            value={bill.status}
                                            onChange={status => handleStatusChange(bill.id, status)}
                                        />
                                    </td>
                                    <td className="px-5 py-3 text-gray-600">
                                        {bill.status_date || "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
                .animate-slide-down { animation: slideDown 0.4s ease-out forwards; }
                .animate-pulse { animation: pulse 1.5s infinite ease-in-out; }
                .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
}
