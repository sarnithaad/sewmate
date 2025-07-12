import React, { useState } from "react";
import { useAuth } from "../context/AuthContext"; // Import useAuth hook

export default function DesignUpload({ dressType, part, onUploadSuccess }) { // Accept onUploadSuccess prop
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState("");
    const [msgType, setMsgType] = useState(""); // 'success' or 'error'
    const [uploading, setUploading] = useState(false);

    const { token } = useAuth(); // Get token from AuthContext

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
        // Ensure dress_type and part are sent with the image upload
        formData.append("dress_type", dressType);
        formData.append("part", part);

        try {
            setUploading(true);
            // First, upload the image to get the URL
            const uploadRes = await fetch(`${process.env.REACT_APP_API_URL}/api/designs/upload`, {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            let uploadData;
            try {
                uploadData = await uploadRes.json();
            } catch {
                setMsg("❌ Server error during image upload: Invalid response format.");
                setMsgType("error");
                return;
            }

            if (!uploadRes.ok) {
                setMsg(`❌ ${uploadData.error || "Image upload failed."}`);
                setMsgType("error");
                return;
            }

            const imageUrl = uploadData.image_url;
            const designName = file.name.split('.')[0]; // Use file name as default design name

            // Second, save the design details (including image_url) to the database
            const saveRes = await fetch(`${process.env.REACT_APP_API_URL}/api/designs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: designName,
                    description: `Design for ${dressType} - ${part}`, // Default description
                    image_url: imageUrl,
                    dress_type: dressType, // Add dress_type to design entry
                    part: part // Add part to design entry
                })
            });

            const saveData = await saveRes.json();
            if (!saveRes.ok) {
                setMsg(`❌ ${saveData.error || "Failed to save design details."}`);
                setMsgType("error");
            } else {
                setMsg(`✅ ${saveData.message || "Design uploaded and saved successfully!"}`);
                setMsgType("success");
                setFile(null);
                document.querySelector("input[type=file]").value = ""; // Reset input

                if (onUploadSuccess) {
                    onUploadSuccess(); // Trigger re-fetch in parent component (Designs.jsx)
                }
            }
        } catch (err) {
            console.error("Upload process error:", err);
            setMsg("❌ Network error or unexpected issue. Please try again.");
            setMsgType("error");
        } finally {
            setUploading(false);
        }
    };

    return (
        <form
            onSubmit={handleUpload}
            className="bg-white p-4 rounded shadow flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-gray-200 mb-6"
        >
            <div className="flex flex-col gap-1 w-full sm:w-auto">
                <label className="text-sm font-medium text-gray-600">Upload Design for {dressType} - {part}</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="block border rounded p-2 text-sm"
                />
                {file && (
                    <span className="text-xs text-gray-500 mt-1">{file.name}</span>
                )}
            </div>

            <button
                type="submit"
                disabled={uploading}
                className={`px-4 py-2 rounded text-sm text-white ${
                    uploading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                }`}
            >
                {uploading ? "Uploading..." : "📤 Upload Design"}
            </button>

            {msg && (
                <div
                    className={`mt-2 text-sm font-medium ${
                        msgType === "success" ? "text-green-600" : "text-red-600"
                    }`}
                >
                    {msg}
                </div>
            )}
        </form>
    );
}
