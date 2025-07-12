import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; // Import useAuth hook

export default function CustomerList() {
    const [bills, setBills] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { token, user } = useAuth(); // Get token and user from AuthContext

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
    }, [user, token]); // Depend on user and token

    const customers = Array.from(
        new Set(bills.map(b => b.customer_name))
    ).sort();

    const filteredCustomers = customers.filter(c =>
        c.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const customerBookings = bills.filter(
        bill => bill.customer_name === selectedCustomer
    );

    return (
        <div className="p-6 min-h-screen bg-gray-50">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Customer List</h2>

            {loading && <div className="text-lg">Loading...</div>}
            {error && <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>}

            {!loading && !error && (
                <>
                    {/* Search Box */}
                    <div className="mb-4 max-w-sm">
                        <input
                            type="text"
                            placeholder="Search customer..."
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Customer List */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
                        {filteredCustomers.map((customer) => (
                            <button
                                key={customer}
                                onClick={() => setSelectedCustomer(customer)}
                                className={`text-sm px-3 py-2 rounded border
                                  ${
                                      selectedCustomer === customer
                                          ? "bg-blue-600 text-white"
                                          : "bg-white hover:bg-blue-100 text-blue-700"
                                  }`}
                            >
                                {customer}
                            </button>
                        ))}
                    </div>

                    {/* Customer Booking Details */}
                    {selectedCustomer && (
                        <div className="bg-white shadow-md p-6 rounded-lg">
                            <h3 className="text-xl font-semibold mb-4 text-green-700">
                                Bookings for {selectedCustomer}
                            </h3>

                            {customerBookings.length === 0 ? (
                                <p className="text-gray-500">No bookings found for this customer.</p>
                            ) : (
                                <table className="w-full text-sm border">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-2 border">Bill No</th> {/* Added Bill No */}
                                            <th className="p-2 border">Booking Date</th>
                                            <th className="p-2 border">Due Date</th>
                                            <th className="p-2 border">Bill Value</th>
                                            {/* <th className="p-2 border">Material Type</th> Removed as it's not in your bill data */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customerBookings.map((bill) => (
                                            <tr key={bill.id}> {/* Changed key to bill.id */}
                                                <td className="p-2 border">{bill.bill_number}</td> {/* Display bill number */}
                                                <td className="p-2 border">{bill.order_date}</td>
                                                <td className="p-2 border">{bill.due_date}</td>
                                                <td className="p-2 border">₹{bill.total_value}</td>
                                                {/* <td className="p-2 border">{bill.material_type}</td> Removed */}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
