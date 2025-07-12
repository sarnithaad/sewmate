import React, { useState, useEffect } from "react";
import DesignUpload from "./DesignUpload";
import { useAuth } from "../context/AuthContext"; // Import useAuth hook

const designTypes = [
    { label: "Chudidhar", value: "Chudidhar" },
    { label: "Blouse", value: "Blouse" },
    { label: "Frock", value: "Frock" },
    { label: "Lehanga", value: "Lehanga" } // Added Lehanga
];

const parts = ["front", "back", "sleeve", "full"]; // Added 'full' for general designs

export default function Designs() {
    const [dressType, setDressType] = useState(designTypes[0].value);
    const [part, setPart] = useState(parts[0]);
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { token, user } = useAuth(); // Get token and user from AuthContext

    // Function to fetch designs based on current filters
    const fetchDesigns = async () => {
        if (!token || !user) {
            setError("Unauthorized: Please log in to view designs.");
            setLoading(false);
            setDesigns([]);
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await fetch(
                `${process.env.REACT_APP_API_URL}/api/designs?dress_type=${dressType}&part=${part}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to fetch designs");
            }
            setDesigns(data);
        } catch (err) {
            console.error("Error fetching designs:", err);
            setError(err.message || "Error loading designs.");
            setDesigns([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch designs whenever dressType, part, token, or user changes
    useEffect(() => {
        fetchDesigns();
    }, [dressType, part, token, user]);

    // Callback for when a new design is successfully uploaded
    const handleUploadSuccess = () => {
        fetchDesigns(); // Re-fetch designs to update the list
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-bold text-indigo-700 mb-6">🎨 Designs</h2>

            {/* Dress Type Selection */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Select Dress Type</h3>
                <div className="flex flex-wrap gap-3">
                    {designTypes.map(dt => (
                        <button
                            key={dt.value}
                            onClick={() => setDressType(dt.value)}
                            type="button"
                            className={`px-4 py-2 rounded shadow-sm border transition ${
                                dressType === dt.value
                                    ? "bg-indigo-600 text-white border-indigo-700"
                                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            {dt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Part Selection */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Select Part</h3>
                <div className="flex flex-wrap gap-3">
                    {parts.map(p => (
                        <button
                            key={p}
                            onClick={() => setPart(p)}
                            type="button"
                            className={`px-4 py-2 rounded shadow-sm border transition ${
                                part === p
                                    ? "bg-blue-600 text-white border-blue-700"
                                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Upload Component - Pass onUploadSuccess */}
            <DesignUpload
                dressType={dressType}
                part={part}
                onUploadSuccess={handleUploadSuccess}
            />

            <h3 className="text-xl font-bold text-indigo-700 mt-8 mb-4">
                Uploaded Designs ({dressType} - {part.charAt(0).toUpperCase() + part.slice(1)})
            </h3>

            {loading ? (
                <p className="text-gray-600">Loading designs...</p>
            ) : error ? (
                <div className="text-red-600 bg-red-100 p-3 rounded border border-red-300">
                    {error}
                </div>
            ) : designs.length === 0 ? (
                <p className="text-gray-500">No designs found for this category.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {designs.map(design => (
                        <div key={design.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <img
                                src={`${process.env.REACT_APP_API_URL}${design.image_url}`}
                                alt={design.name}
                                className="w-full h-32 object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/128x128/cccccc/333333?text=No+Image"; }} // Fallback
                            />
                            <div className="p-3">
                                <p className="font-semibold text-gray-800 text-sm">{design.name}</p>
                                <p className="text-xs text-gray-600">{design.dress_type} - {design.part}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
