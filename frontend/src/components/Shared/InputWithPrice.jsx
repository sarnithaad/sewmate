import React from "react";

export default function InputWithPrice({ label, value, price, onValueChange, onPriceChange }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3">
      <label className="w-full sm:w-40 font-medium text-gray-700">{label}</label>
      <input
        type="text"
        placeholder="Measurement"
        className="border border-gray-300 rounded px-3 py-2 w-full sm:w-40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        value={value}
        onChange={e => onValueChange(e.target.value)}
      />
      <input
        type="number"
        placeholder="₹"
        className="border border-gray-300 rounded px-3 py-2 w-full sm:w-32 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        value={price}
        onChange={e => onPriceChange(e.target.value)}
      />
    </div>
  );
}
