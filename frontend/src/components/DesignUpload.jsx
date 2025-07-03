import React, { useState } from "react";

export default function DesignUpload({ dressType, part }) {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  const handleUpload = async e => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    formData.append("shopkeeper_id", 1); // Replace with dynamic shopkeeper_id
    formData.append("dress_type", dressType);
    formData.append("part", part);

    const res = await fetch("/api/designs/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setMsg(data.message || "Upload failed");
  };

  return (
    <form onSubmit={handleUpload} className="flex items-center gap-2">
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
      <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded">Upload</button>
      {msg && <span>{msg}</span>}
    </form>
  );
}
