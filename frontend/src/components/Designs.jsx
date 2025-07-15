import React, { useState, useEffect } from "react";
import DesignUpload from "./DesignUpload";
import { useAuth } from "../context/AuthContext";

const designTypes = [
    { label: "Chudidhar", value: "Chudidhar" },
    { label: "Blouse", value: "Blouse" },
    { label: "Frock", value: "Frock" },
    { label: "Lehanga", value: "Lehanga" }
];

const parts = ["front", "back", "sleeve", "full"];

export default function Designs() {
    const [dressType, setDressType] = useState(designTypes[0].value);
    const [part, setPart] = useState(parts[0]);
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { token, user } = useAuth();

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
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to fetch designs");

            setDesigns(data);
        } catch (err) {
            console.error("Error fetching designs:", err);
            setError(err.message || "Error loading designs.");
            setDesigns([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDesigns();
    }, [dressType, part, token, user]);

    const handleUploadSuccess = () => {
        fetchDesigns();
    };

    return (
        <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen font-inter">
            <h2 className="text-4xl font-extrabold text-purple-800 mb-8 rounded-xl p-4 bg-white shadow-xl text-center animate-fade-in flex items-center justify-center">
                <img
                    src="https://placehold.co/50x50/a78bfa/ffffff?text=Design"
                    alt="Designs Icon"
                    className="h-12 w-12 rounded-full mr-4 shadow-md"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/50x50/cccccc/333333?text=Err";
                    }}
                />
                🎨 Designs
            </h2>

            {/* Dress Type */}
            <div className="mb-6 bg-white p-6 rounded-xl shadow-md animate-fade-in-up">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2 text-2xl">👗</span> Select Dress Type
                </h3>
                <div className="flex flex-wrap gap-3">
                    {designTypes.map(dt => (
                        <button
                            key={dt.value}
                            onClick={() => setDressType(dt.value)}
                            type="button"
                            className={`px-5 py-2 rounded-full font-medium shadow-sm border-2 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md ${
                                dressType === dt.value
                                    ? "bg-indigo-600 text-white border-indigo-700 shadow-lg"
                                    : "bg-white border-gray-300 text-gray-700 hover:bg-indigo-50 hover:text-indigo-800"
                            }`}
                        >
                            {dt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Part Selection */}
            <div className="mb-8 bg-white p-6 rounded-xl shadow-md animate-fade-in-up">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2 text-2xl">✂️</span> Select Part
                </h3>
                <div className="flex flex-wrap gap-3">
                    {parts.map(p => (
                        <button
                            key={p}
                            onClick={() => setPart(p)}
                            type="button"
                            className={`px-5 py-2 rounded-full font-medium shadow-sm border-2 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-md ${
                                part === p
                                    ? "bg-blue-600 text-white border-blue-700 shadow-lg"
                                    : "bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:text-blue-800"
                            }`}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Upload Component */}
            <DesignUpload
                dressType={dressType}
                part={part}
                onUploadSuccess={handleUploadSuccess}
            />

            {/* Uploaded Designs */}
            <h3 className="text-2xl font-bold text-indigo-700 mt-10 mb-6 flex items-center animate-fade-in-up">
                <span className="mr-2 text-3xl">🖼️</span> Uploaded Designs ({dressType} - {part.charAt(0).toUpperCase() + part.slice(1)})
            </h3>

            {loading ? (
                <p className="text-gray-700 text-xl p-6 bg-white rounded-lg shadow-lg text-center animate-pulse">Loading designs...</p>
            ) : error ? (
                <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg shadow-md animate-slide-down">
                    ❌ {error}
                </div>
            ) : designs.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-lg bg-white rounded-xl shadow-md animate-fade-in-up">
                    <p>No designs found for this category.</p>
                    <img
                        src="https://placehold.co/150x150/f5f5dc/8b4513?text=Empty"
                        alt="No Designs Icon"
                        className="mx-auto mt-6 rounded-full shadow-md"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/150x150/cccccc/333333?text=Error";
                        }}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in-up">
                    {designs.map(design => (
                        <div key={design.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-200">
                            <img
                                src={`${process.env.REACT_APP_API_URL}${design.image_url}`}
                                alt={design.name}
                                className="w-full h-40 object-cover border-b border-gray-200"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://placehold.co/160x160/cccccc/333333?text=No+Image";
                                }}
                            />
                            <div className="p-4">
                                <p className="font-bold text-gray-800 text-lg mb-1">{design.name}</p>
                                <p className="text-sm text-gray-600">{design.dress_type} - {design.part}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Animation Styles */}
            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.7s ease-out forwards;
                }
                .animate-slide-down {
                    animation: slideDown 0.5s ease-out forwards;
                }
                .animate-pulse {
                    animation: pulse 1.5s infinite ease-in-out;
                }
                `}
            </style>
        </div>
    );
}
