import React, { forwardRef } from "react";

const formatDate = date => date ? new Date(date).toLocaleDateString() : "-";

const PrintableBill = forwardRef(({ bill }, ref) => (
    <div ref={ref} className="p-6 min-w-[350px] max-w-[600px] mx-auto font-sans border border-gray-300 rounded bg-white">
        <h2 className="text-2xl font-bold mb-4 text-center text-indigo-700">🧾 SewMate Bill</h2>
        <hr className="mb-4" />

        <div className="mb-2"><strong>Bill No:</strong> {bill.bill_number}</div>
        <div className="mb-2"><strong>Customer:</strong> {bill.customer_name}</div>
        <div className="mb-2"><strong>Mobile:</strong> {bill.mobile}</div>
        <div className="mb-2"><strong>Dress Type:</strong> {bill.dress_type}</div>
        <div className="mb-2"><strong>Order Date:</strong> {formatDate(bill.order_date)}</div>
        <div className="mb-4"><strong>Due Date:</strong> {formatDate(bill.due_date)}</div>

        {/* Measurements */}
        <div className="mb-2 font-semibold text-gray-700">📏 Measurements</div>
        <table className="w-full text-sm border mb-4">
            <thead>
                <tr className="bg-gray-100">
                    <th className="border px-2 py-1 text-left">Measurement</th>
                    <th className="border px-2 py-1 text-left">Value</th>
                </tr>
            </thead>
            <tbody>
                {bill.measurements && Object.entries(bill.measurements).map(([key, val]) => (
                    <tr key={key}>
                        <td className="border px-2 py-1">{key}</td>
                        <td className="border px-2 py-1">{val}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        {bill.design_url && (
            <div className="mt-4">
                <h4 className="text-sm font-medium">Design</h4>
                <img src={bill.design_url} alt="Design" className="h-32 rounded mt-2" />
            </div>
        )}

        {/* Extras */}
        {bill.extras && bill.extras.length > 0 && (
            <>
                <div className="mb-2 font-semibold text-gray-700">➕ Additional Items</div>
                <table className="w-full text-sm border mb-4">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border px-2 py-1 text-left">Item</th>
                            <th className="border px-2 py-1 text-left">Price (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bill.extras.map((item, index) => (
                            <tr key={index}>
                                <td className="border px-2 py-1">{item.name}</td>
                                <td className="border px-2 py-1">{item.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </>
        )}

        <div className="mt-4 text-lg font-bold text-right">
            Total: ₹{Number(bill.total_value || 0).toLocaleString("en-IN")}
        </div>
    </div>
));

export default PrintableBill;
