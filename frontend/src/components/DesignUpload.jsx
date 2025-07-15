import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function DesignUpload({ dressType = "Unknown", part = "General", onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState("");
    const [msgType, setMsgType] = useState(""); // 'success' or 'error'
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const { token } = useAuth();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(selectedFile);
        } else {
            setImagePreview(null);
        }

        setMsg("");
        setMsgType("");
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setMsg("");
        setMsgType("");

        if (!file) {
            setMsg("❌ Please select an image file.");
            setMsgType("error");
            return;
        }

        if (!token) {
            setMsg("❌ Unauthorized: Please log in again.");
            setMsgType("error");
            return;
        }

        const formData = new FormData();
        formData.append("image", file);
        formData.append("dress_type", dressType);
        formData.append("part", part);

        try {
            setUploading(true);

            const uploadRes = await fetch(`${process.env.REACT_APP_API_URL}/api/designs/upload`, {
                method: "POST",
                body: formData,
                headers: { Authorization: `Bearer ${token}` },
            });

            const uploadData = await uploadRes.json();

            if (!uploadRes.ok) {
                setMsg(`❌ ${uploadData.error || "Image upload failed."}`);
                setMsgType("error");
                return;
            }

            const imageUrl = uploadData.image_url;
            const designName = file.name.split(".")[0];

            const saveRes = await fetch(`${process.env.REACT_APP_API_URL}/api/designs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: designName,
                    description: `Design for ${dressType} - ${part}`,
                    image_url: imageUrl,
                    dress_type: dressType,
                    part: part,
                }),
            });

            const saveData = await saveRes.json();

            if (!saveRes.ok) {
                setMsg(`❌ ${saveData.error || "Failed to save design details."}`);
                setMsgType("error");
            } else {
                setMsg(`✅ ${saveData.message || "Design uploaded and saved successfully!"}`);
                setMsgType("success");
                setFile(null);
                setImagePreview(null);
                document.querySelector("input[type=file]").value = "";

                if (onUploadSuccess) onUploadSuccess();
            }
        } catch (err) {
            console.error("Upload error:", err);
            setMsg("❌ Network error or unexpected issue. Please try again.");
            setMsgType("error");
        } finally {
            setUploading(false);
        }
    };

    return (
        <form
            onSubmit={handleUpload}
            className="bg-[#FDF0F3] p-6 rounded-xl shadow-xl flex flex-col md:flex-row items-center gap-6 border border-[#E0C0C6] mb-8 animate-fade-in-up font-inter"
        >
            <div className="flex flex-col gap-3 w-full md:w-auto flex-grow">
                <label className="text-lg font-semibold text-[#754F4F] flex items-center">
                    <img
                        src="https://placehold.co/30x30/FDF0F3/754F4F?text=Up"
                        alt="Upload Icon"
                        className="h-7 w-7 rounded-full mr-2 shadow-sm"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/30x30/cccccc/333333?text=Err";
                        }}
                    />
                    Upload Design for <span className="ml-1 text-[#754F4F] font-bold">{dressType}</span> -{" "}
                    <span className="ml-1 text-[#D1A6AD] font-bold">{part}</span>
                </label>

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-[#754F4F]
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-[#F2E5E8] file:text-[#754F4F]
                        hover:file:bg-[#E0C0C6] cursor-pointer
                        focus:outline-none focus:ring-2 focus:ring-[#D1A6AD] focus:ring-opacity-75"
                />

                {file && (
                    <span className="text-sm text-[#754F4F] mt-1 italic">Selected: {file.name}</span>
                )}

                {imagePreview && (
                    <div className="mt-4 border border-[#E0C0C6] rounded-lg overflow-hidden shadow-md">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-40 object-cover rounded"
                        />
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={uploading}
                className={`px-6 py-3 rounded-full text-base font-bold transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg ${
                    uploading
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                        : "bg-[#D1A6AD] text-white hover:bg-[#C2949D] focus:outline-none focus:ring-2 focus:ring-[#E0B8BE] focus:ring-opacity-75"
                }`}
            >
                {uploading ? (
                    <span className="flex items-center">
                        <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Uploading...
                    </span>
                ) : (
                    "📤 Upload Design"
                )}
            </button>

            {msg && (
                <div
                    className={`mt-4 p-3 rounded-lg font-medium text-center w-full animate-slide-down ${
                        msgType === "success"
                            ? "bg-green-100 text-green-700 border border-green-300 shadow-md"
                            : "bg-red-100 text-red-700 border border-red-300 shadow-md"
                    }`}
                    aria-live="polite"
                >
                    {msg}
                </div>
            )}

            {/* Animation styles */}
            <style>
                {`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.7s ease-out forwards;
                }
                .animate-slide-down {
                    animation: slideDown 0.5s ease-out forwards;
                }
                `}
            </style>
        </form>
    );
}
