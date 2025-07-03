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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/shopkeepers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-blue-700 mb-6">Create Your Shopkeeper Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: "shop_name", label: "Shop Name" },
            { name: "owner_name", label: "Owner Name" },
            { name: "email", label: "Email", type: "email" },
            { name: "password", label: "Password", type: "password" },
            { name: "mobile", label: "Mobile Number" },
            { name: "address", label: "Shop Address" }
          ].map(({ name, label, type = "text" }) => (
            <div key={name}>
              <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                name={name}
                id={name}
                value={form[name]}
                onChange={handleChange}
                required={name !== "address"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          {error && <p className="text-sm text-red-600">❌ {error}</p>}
          {success && <p className="text-sm text-green-600">✅ Registration successful! Redirecting to login...</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition duration-150"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
