import React, { useState } from "react";

export default function DesignUpload({ dressType, part }) {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState(""); // 'success' or 'error'

  const shopkeeper = JSON.parse(localStorage.getItem("shopkeeper") || "{}");
  const shopkeeperId = shopkeeper.id;

  const handleUpload = async e => {
    e.preventDefault();
    setMsg("");

    if (!file) {
      setMsg("❌ Please select a file.");
      setMsgType("error");
      return;
    }

    if (!shopkeeperId) {
      setMsg("❌ Shopkeeper not found.");
      setMsgType("error");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("shopkeeper_id", shopkeeperId);
    formData.append("dress_type", dressType);
    formData.append("part", part);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/designs/upload`, {
        method: "POST",
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setMsg("❌ Server error: invalid response");
        setMsgType("error");
        return;
      }

      if (!res.ok) {
        setMsg(`❌ ${data.error || "Upload failed"}`);
        setMsgType("error");
      } else {
        setMsg(`✅ ${data.message || "Upload successful!"}`);
        setMsgType("success");
        setFile(null); // reset file
      }
    } catch (err) {
      setMsg("❌ Network error. Please try again.");
      setMsgType("error");
    }
  };

  return (
    <form
      onSubmit={handleUpload}
      className="bg-white p-4 rounded shadow flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-gray-200"
    >
      <div className="flex flex-col gap-1 w-full sm:w-auto">
        <label className="text-sm font-medium text-gray-600">Upload Design</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setFile(e.target.files[0])}
          className="block border rounded p-2 text-sm"
        />
        {file && (
          <span className="text-xs text-gray-500 mt-1">{file.name}</span>
        )}
      </div>

      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
      >
        📤 Upload
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
