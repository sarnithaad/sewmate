import React from "react";

export default function InputWithPrice({ label, value, price, onValueChange, onPriceChange }) {
  return (
    <div className="flex gap-2 items-center">
      <label className="w-40">{label}</label>
      <input
        type="text"
        placeholder="Measurement"
        className="border p-1 rounded"
        value={value}
        onChange={e => onValueChange(e.target.value)}
      />
      <input
        type="number"
        placeholder="Price"
        className="border p-1 rounded"
        value={price}
        onChange={e => onPriceChange(e.target.value)}
      />
    </div>
  );
}
