import React from "react";

const options = [
    "Booked", "Cut", "Stitched", "Packed", "Delivered"
];

export default function StatusDropdown({ value, onChange }) {
    return (
        <select
            className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={value}
            onChange={e => onChange(e.target.value)}
        >
            {options.map(opt => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    );
}
