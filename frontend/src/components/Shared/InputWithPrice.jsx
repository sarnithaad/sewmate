import React from "react";

export default function InputWithPrice({ label, value, price, onValueChange, onPriceChange }) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 p-4 bg-white rounded-lg shadow-md border border-gray-200 animate-fade-in-up font-inter">
      <label className="w-full sm:w-40 text-base font-semibold text-gray-800 flex items-center">
        <img
          src="https://placehold.co/24x24/e0f2f7/000080?text=+"
          alt="Item Icon"
          className="h-6 w-6 rounded-full mr-2 shadow-sm"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/24x24/cccccc/333333?text=Err'; }}
        />
        {label}
      </label>
      <input
        type="text"
        placeholder="Measurement"
        className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:flex-grow text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200 shadow-sm"
        value={value}
        onChange={e => onValueChange(e.target.value)}
      />
      <input
        type="number"
        placeholder="₹ Price"
        className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-32 text-base focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200 shadow-sm"
        value={price}
        onChange={e => onPriceChange(e.target.value)}
      />
      {/* Basic CSS for animations (can be moved to index.css or a dedicated styles file) */}
      <style>
        {`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.7s ease-out forwards;
        }
        `}
      </style>
    </div>
  );
}
