import React, { forwardRef } from "react";

const formatDate = date => date ? new Date(date).toLocaleDateString("en-IN") : "-";

const PrintableBill = forwardRef(({ bill }, ref) => (
  <div
    ref={ref}
    className="p-8 min-w-[350px] max-w-[700px] mx-auto font-inter bg-gradient-to-br from-[#EDC9C9] to-[#D6C8C8] border border-[#D8B4B4] rounded-xl shadow-2xl animate-fade-in"
  >
    <div className="flex items-center justify-center mb-6">
      <img
        src="https://placehold.co/60x60/B88E8E/ffffff?text=Bill"
        alt="Bill Icon"
        className="h-16 w-16 rounded-full mr-4 shadow-lg"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://placehold.co/60x60/cccccc/333333?text=Err';
        }}
      />
      <h2 className="text-4xl font-extrabold text-[#7C4D4D] text-center">SewMate Bill</h2>
    </div>
    <hr className="border-t-2 border-[#B88E8E] mb-6" />

    {/* Bill Info */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-lg">
      {[
        ["Bill No", bill.bill_number, "#EDC9C9"],
        ["Customer", bill.customer_name, "#D8B4B4"],
        ["Mobile", bill.mobile, "#B88E8E"],
        ["Dress Type", bill.dress_type, "#D6C8C8"],
        ["Order Date", formatDate(bill.order_date), "#EDC9C9"],
        ["Due Date", formatDate(bill.due_date), "#FADADA"],
      ].map(([label, value, bg], idx) => (
        <div
          key={idx}
          className="flex justify-between items-center p-3 rounded-lg shadow-sm"
          style={{ backgroundColor: bg }}
        >
          <strong className="text-[#7C4D4D]">{label}:</strong>
          <span className="font-semibold text-[#3E2C23]">{value}</span>
        </div>
      ))}
    </div>

    {/* Measurements */}
    <div className="mb-4">
      <h3 className="font-bold text-xl text-[#7C4D4D] mb-3 flex items-center">
        <span className="mr-2 text-2xl">📏</span> Measurements
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-base border-collapse rounded-lg overflow-hidden shadow-md">
          <thead className="bg-[#F3E5E5] text-[#3E2C23] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-2 border text-left">Measurement</th>
              <th className="px-4 py-2 border text-left">Value</th>
            </tr>
          </thead>
          <tbody>
            {bill.measurements && Object.entries(bill.measurements).map(([key, val]) => (
              <tr key={key} className="border-t border-[#D6C8C8] even:bg-[#F7EBEB]">
                <td className="px-4 py-2 border">{key}</td>
                <td className="px-4 py-2 border">{val}</td>
              </tr>
            ))}
            {Object.keys(bill.measurements || {}).length === 0 && (
              <tr>
                <td colSpan="2" className="text-center py-4 text-[#85704D] italic">No measurements entered.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Design */}
    {bill.design_url && (
      <div className="mt-6 mb-6 p-4 bg-white rounded-xl shadow-lg border border-[#D8B4B4] text-center">
        <h4 className="text-xl font-bold text-[#7C4D4D] mb-3 flex items-center justify-center">
          <span className="mr-2 text-2xl">🖼️</span> Selected Design
        </h4>
        <img
          src={bill.design_url}
          alt="Design"
          className="h-48 w-auto object-contain mx-auto rounded-lg shadow-md border border-gray-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/192x192/cccccc/333333?text=No+Image";
          }}
        />
      </div>
    )}

    {/* Extras */}
    {bill.extras && bill.extras.length > 0 && (
      <div className="mb-4">
        <h3 className="font-bold text-xl text-[#7C4D4D] mb-3 flex items-center">
          <span className="mr-2 text-2xl">➕</span> Additional Items
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-base border-collapse rounded-lg overflow-hidden shadow-md">
            <thead className="bg-[#F3E5E5] text-[#3E2C23] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2 border text-left">Item</th>
                <th className="px-4 py-2 border text-left">Price (₹)</th>
              </tr>
            </thead>
            <tbody>
              {bill.extras.map((item, index) => (
                <tr key={index} className="border-t border-[#D6C8C8] even:bg-[#F7EBEB]">
                  <td className="px-4 py-2 border">{item.name}</td>
                  <td className="px-4 py-2 border">₹{Number(item.price || 0).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* Total */}
    <div className="mt-8 text-3xl font-extrabold text-[#166534] text-right p-4 bg-[#F0FDF4] rounded-lg shadow-lg border border-green-200">
      Total: ₹{Number(bill.total_value || 0).toLocaleString("en-IN")}
    </div>

    {/* Animations and Print Styles */}
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
