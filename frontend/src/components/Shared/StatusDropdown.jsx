import React from "react";

const options = [
    "Booked", "Cut", "Stitched", "Packed", "Delivered"
];

export default function StatusDropdown({ value, onChange }) {
    return (
        <select
            className="border border-[#E0C0C6] rounded-lg px-4 py-2 text-base text-[#5A3F44] bg-[#F9E9EC] shadow-md focus:outline-none focus:ring-2 focus:ring-[#C2949D] transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg animate-fade-in-up font-inter" // Updated colors
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
