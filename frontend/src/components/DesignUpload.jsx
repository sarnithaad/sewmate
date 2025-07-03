import React, { useState } from "react";

export default function DesignUpload({ dressType, part }) {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  // Get shopkeeper ID from localStorage
  const shopkeeper = JSON.parse(localStorage.getItem("shopkeeper") || "{}");
  const shopkeeperId = shopkeeper.id;

  const handleUpload = async e => {
    e.preventDefault();
    setMsg("");
    if (!file) {
      setMsg("Please select a file.");
      return;
    }
    if (!shopkeeperId) {
      setMsg("Shopkeeper not found.");
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
        setMsg("Server error: invalid response");
        return;
      }
      if (!res.ok) {
        setMsg(data.error || "Upload failed");
      } else {
        setMsg(data.message || "Upload successful!");
      }
    } catch (err) {
      setMsg("Network error. Please try again.");
    }
  };

  return (
    <form onSubmit={handleUpload} className="flex items-center gap-2">
      <input
        type="file"
        accept="image/*"
        onChange={e => setFile(e.target.files[0])}
      />
      <button
        type="submit"
        className="bg-green-500 text-white px-3 py-1 rounded"
      >
        Upload
      </button>
      {msg && <span>{msg}</span>}
    </form>
  );
}
