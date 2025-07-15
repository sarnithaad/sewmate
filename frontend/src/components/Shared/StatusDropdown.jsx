import React from "react";

const options = [
    "Booked", "Cut", "Stitched", "Packed", "Delivered"
];

export default function StatusDropdown({ value, onChange }) {
    return (
        <select
            className="border border-gray-300 rounded-lg px-4 py-2 text-base text-gray-700 bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg animate-fade-in-up font-inter"
            value={value}
            onChange={e => onChange(e.target.value)}
        >
            {options.map(opt => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
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
        </select>
    );
}
