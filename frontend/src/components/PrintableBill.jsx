import React, { forwardRef } from "react";

const formatDate = date => date ? new Date(date).toLocaleDateString("en-IN") : "-"; // Use en-IN for consistent date format

const PrintableBill = forwardRef(({ bill }, ref) => (
    <div ref={ref} className="p-8 min-w-[350px] max-w-[700px] mx-auto font-inter bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl shadow-2xl animate-fade-in">
        <div className="flex items-center justify-center mb-6">
            <img
                src="https://placehold.co/60x60/4f46e5/ffffff?text=Bill"
                alt="Bill Icon"
                className="h-16 w-16 rounded-full mr-4 shadow-lg"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/60x60/cccccc/333333?text=Err'; }}
            />
            <h2 className="text-4xl font-extrabold text-indigo-800 text-center">SewMate Bill</h2>
        </div>
        <hr className="border-t-2 border-indigo-300 mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-lg">
            <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-lg shadow-sm">
                <strong className="text-indigo-700">Bill No:</strong> <span className="font-semibold text-indigo-900">{bill.bill_number}</span>
            </div>
            <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg shadow-sm">
                <strong className="text-blue-700">Customer:</strong> <span className="font-semibold text-blue-900">{bill.customer_name}</span>
            </div>
            <div className="flex justify-between items-center bg-purple-50 p-3 rounded-lg shadow-sm">
                <strong className="text-purple-700">Mobile:</strong> <span className="font-semibold text-purple-900">{bill.mobile}</span>
            </div>
            <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg shadow-sm">
                <strong className="text-green-700">Dress Type:</strong> <span className="font-semibold text-green-900">{bill.dress_type}</span>
            </div>
            <div className="flex justify-between items-center bg-yellow-50 p-3 rounded-lg shadow-sm">
                <strong className="text-yellow-700">Order Date:</strong> <span className="font-semibold text-yellow-900">{formatDate(bill.order_date)}</span>
            </div>
            <div className="flex justify-between items-center bg-red-50 p-3 rounded-lg shadow-sm">
                <strong className="text-red-700">Due Date:</strong> <span className="font-semibold text-red-900">{formatDate(bill.due_date)}</span>
            </div>
        </div>

        {/* Measurements */}
        <div className="mb-4">
            <h3 className="font-bold text-xl text-indigo-700 mb-3 flex items-center">
                <span className="mr-2 text-2xl">📏</span> Measurements
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-base border-collapse rounded-lg overflow-hidden shadow-md">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-2 border text-left">Measurement</th>
                            <th className="px-4 py-2 border text-left">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bill.measurements && Object.entries(bill.measurements).map(([key, val]) => (
                            <tr key={key} className="border-t border-gray-200 even:bg-gray-50">
                                <td className="px-4 py-2 border">{key}</td>
                                <td className="px-4 py-2 border">{val}</td>
                            </tr>
                        ))}
                        {Object.keys(bill.measurements).length === 0 && (
                            <tr>
                                <td colSpan="2" className="text-center py-4 text-gray-500 italic">No measurements entered.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {bill.design_url && (
            <div className="mt-6 mb-6 p-4 bg-white rounded-xl shadow-lg border border-gray-200 text-center">
                <h4 className="text-xl font-bold text-indigo-700 mb-3 flex items-center justify-center">
                    <span className="mr-2 text-2xl">🖼️</span> Selected Design
                </h4>
                <img
                    src={bill.design_url}
                    alt="Design"
                    className="h-48 w-auto object-contain mx-auto rounded-lg shadow-md border border-gray-300"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/192x192/cccccc/333333?text=No+Image"; }} // Fallback
                />
            </div>
        )}

        {/* Extras */}
        {bill.extras && bill.extras.length > 0 && (
            <div className="mb-4">
                <h3 className="font-bold text-xl text-indigo-700 mb-3 flex items-center">
                    <span className="mr-2 text-2xl">➕</span> Additional Items
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-base border-collapse rounded-lg overflow-hidden shadow-md">
                        <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-2 border text-left">Item</th>
                                <th className="px-4 py-2 border text-left">Price (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bill.extras.map((item, index) => (
                                <tr key={index} className="border-t border-gray-200 even:bg-gray-50">
                                    <td className="px-4 py-2 border">{item.name}</td>
                                    <td className="px-4 py-2 border">₹{Number(item.price || 0).toLocaleString("en-IN")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        <div className="mt-8 text-3xl font-extrabold text-green-700 text-right p-4 bg-green-100 rounded-lg shadow-lg border border-green-200">
            Total: ₹{Number(bill.total_value || 0).toLocaleString("en-IN")}
        </div>

        {/* Basic CSS for animations (can be moved to index.css or a dedicated styles file) */}
        <style>
            {`
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fadeIn 0.8s ease-out forwards;
            }
            @media print {
                body * {
                    visibility: hidden;
                }
                .p-8, .p-8 * {
                    visibility: visible;
                }
                .p-8 {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    max-width: none;
                    box-shadow: none;
                    border: none;
                    background: none;
                }
                .no-print {
                    display: none;
                }
            }
            `}
        </style>
    </div>
));

export default PrintableBill;
