import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function CustomerList() {
    const [bills, setBills] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { token, user } = useAuth();
    const bookingsRef = useRef(null);

    useEffect(() => {
        if (!user || !token) {
            setError("Unauthorized: Please log in.");
            setLoading(false);
            setBills([]);
            return;
        }

        setLoading(true);
        setError("");

        fetch(`${process.env.REACT_APP_API_URL}/api/bills`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async res => {
                if (!res.ok) {
                    let msg = "Failed to fetch bills";
                    try {
                        const data = await res.json();
                        msg = data.error || msg;
                    } catch { }
                    throw new Error(msg);
                }
                return res.json();
            })
            .then(data => {
                setBills(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || "Error loading customers");
                setLoading(false);
                setBills([]);
            });
    }, [user, token]);

    const customers = Array.from(new Set(bills.map(b => b.customer_name))).sort();
    const filteredCustomers = customers.filter(c =>
        c.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const customerBookings = bills.filter(
        bill => bill.customer_name === selectedCustomer
    );

    const scrollToBookings = () => {
        setTimeout(() => {
            bookingsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <div className="p-6 min-h-screen bg-gradient-to-br from-[#FDF6EC] to-[#D2B48C] font-inter">
            <h2 className="text-4xl font-extrabold text-[#5C4033] mb-8 rounded-xl p-4 bg-white shadow-xl text-center animate-fade-in flex items-center justify-center">
                <img
                    src="https://placehold.co/50x50/5C4033/ffffff?text=CL"
                    alt="Customer List Icon"
                    className="h-12 w-12 rounded-full mr-4 shadow-md"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/cccccc/333333?text=Err'; }}
                />
                👥 Customer List
            </h2>

            {loading ? (
                <p className="text-[#5C4033] text-xl p-6 bg-white rounded-lg shadow-lg text-center animate-pulse">Loading customers...</p>
            ) : (
                <>
                    {error && (
                        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6 shadow-md animate-slide-down">
                            ❌ {error}
                        </div>
                    )}

                    {/* Search Box */}
                    <div className="mb-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg p-4 animate-fade-in-up">
                        <input
                            type="text"
                            placeholder="🔍 Search customer..."
                            className="w-full p-3 border border-[#A67B5B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4033] transition-all duration-200 text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Customer List */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8 animate-fade-in-up">
                        {filteredCustomers.length === 0 ? (
                            <div className="col-span-full text-center text-[#5C4033] text-lg py-4">
                                <p>No customers {searchTerm ? `matching "${searchTerm}"` : "available"}.</p>
                                <img
                                    src="https://placehold.co/150x150/FDF6EC/5C4033?text=Empty"
                                    alt="No Customers Icon"
                                    className="mx-auto mt-6 rounded-full shadow-md"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/cccccc/333333?text=Error'; }}
                                />
                            </div>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <button
                                    key={customer}
                                    onClick={() => {
                                        setSelectedCustomer(customer);
                                        scrollToBookings();
                                    }}
                                    className={`text-base px-4 py-3 rounded-xl border-2 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg
                                    ${selectedCustomer === customer
                                            ? "bg-gradient-to-r from-[#5C4033] to-[#A67B5B] text-white border-[#5C4033]"
                                            : "bg-white hover:bg-[#FDF6EC] text-[#5C4033] border-[#A67B5B] shadow-sm"
                                        }`}
                                >
                                    <span className="mr-2">👤</span> {customer}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Customer Booking Details */}
                    {selectedCustomer && (
                        <div ref={bookingsRef} className="bg-white shadow-xl p-8 rounded-xl animate-fade-in-up">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-[#5C4033] flex items-center">
                                    <img
                                        src="https://placehold.co/40x40/FDF6EC/5C4033?text=B"
                                        alt="Bookings Icon"
                                        className="h-10 w-10 rounded-full mr-3 shadow-sm"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/cccccc/333333?text=Err'; }}
                                    />
                                    Bookings for <span className="text-black ml-2">{selectedCustomer}</span>
                                </h3>
                                <div className="text-sm text-right text-[#5C4033]">
                                    <div>Total Bookings: <strong>{customerBookings.length}</strong></div>
                                    <div>
                                        Total Value:{" "}
                                        <strong className="text-black">
                                            ₹{customerBookings.reduce((sum, b) => sum + (b.total_value || 0), 0)}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            {customerBookings.length === 0 ? (
                                <p className="text-[#5C4033] text-lg text-center py-4">No bookings found for this customer.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-base text-left border-collapse">
                                        <thead className="bg-[#FDF6EC] text-[#5C4033] uppercase tracking-wider">
                                            <tr>
                                                <th className="px-4 py-3 border-b-2 border-[#A67B5B]">Bill No</th>
                                                <th className="px-4 py-3 border-b-2 border-[#A67B5B]">Booking Date</th>
                                                <th className="px-4 py-3 border-b-2 border-[#A67B5B]">Due Date</th>
                                                <th className="px-4 py-3 border-b-2 border-[#A67B5B]">Bill Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customerBookings.map((bill) => (
                                                <tr key={bill.id} className="border-t border-[#F3E5D0] hover:bg-[#FDF6EC] transition-colors duration-200 ease-in-out animate-fade-in-up">
                                                    <td className="px-4 py-3 font-semibold text-[#5C4033]">{bill.bill_number}</td>
                                                    <td className="px-4 py-3 text-[#5C4033]">{bill.order_date}</td>
                                                    <td className="px-4 py-3 text-[#5C4033]">{bill.due_date}</td>
                                                    <td className="px-4 py-3 font-semibold text-[#000000]">₹{bill.total_value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Animations */}
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
                .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
                .animate-slide-down { animation: slideDown 0.5s ease-out forwards; }
                .animate-pulse { animation: pulse 1.5s infinite ease-in-out; }
                .animate-fade-in-up { animation: fadeInUp 0.7s ease-out forwards; }
                `}
            </style>
        </div>
    );
}
