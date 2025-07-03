import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ShopkeeperRegister() {
  const [form, setForm] = useState({
    shop_name: "",
    owner_name: "",
    email: "",
    password: "",
    mobile: "",
    address: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/shopkeepers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed");
      } else {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Shopkeeper Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="shop_name"
          placeholder="Shop Name"
          value={form.shop_name}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <input
          name="owner_name"
          placeholder="Owner Name"
          value={form.owner_name}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
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
        <input
          name="mobile"
          placeholder="Mobile Number"
          value={form.mobile}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <input
          name="address"
          placeholder="Shop Address"
          value={form.address}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        {error && <div className="text-red-600">{error}</div>}
        {success && <div className="text-green-600">Registration successful! Redirecting to login...</div>}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Register
        </button>
      </form>
      <div className="mt-4 text-center">
        Already registered?{" "}
        <Link to="/login" className="text-blue-600 underline">
          Login here
        </Link>
      </div>
    </div>
  );
}
