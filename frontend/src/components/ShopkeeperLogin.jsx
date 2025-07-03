import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ShopkeeperLogin() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(
  `${process.env.REACT_APP_API_URL}/api/shopkeepers/login`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form)
  }
));
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        // Save token and shopkeeper info as needed (e.g., in localStorage)
        localStorage.setItem("token", data.token);
        localStorage.setItem("shopkeeper", JSON.stringify(data.shopkeeper));
        navigate("/dashboard"); // Change to your main page after login
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Shopkeeper Login</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        {error && <div className="text-red-600">{error}</div>}
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full">
          Login
        </button>
      </form>
      <div className="mt-4 text-center">
        New shopkeeper?{" "}
        <Link to="/" className="text-blue-600 underline">
          Register here
        </Link>
      </div>
    </div>
  );
}
