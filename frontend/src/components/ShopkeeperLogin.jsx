import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import useAuth hook

export default function ShopkeeperLogin() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth(); // Get the login function from AuthContext

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/shopkeepers/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Login failed");
            } else {
                // Call the login function from AuthContext to update global state
                login(data.shopkeeper, data.token);
                navigate("/dashboard");
            }
        } catch (err) {
            console.error("Login fetch error:", err); // Log the actual error
            setError("Network error. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-center text-green-700 mb-6">Shopkeeper Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                        { name: "email", label: "Email", type: "email" },
                        { name: "password", label: "Password", type: "password" }
                    ].map(({ name, label, type }) => (
                        <div key={name}>
                            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                            <input
                                type={type}
                                name={name}
                                id={name}
                                value={form[name]}
                                onChange={handleChange}
                                required
                                autoComplete={name === "password" ? "current-password" : "username"}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    ))}

                    {error && <p className="text-sm text-red-600">❌ {error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded transition duration-150"
                    >
                        Login
                    </button>
                </form>

                <p className="mt-4 text-sm text-center">
                    New shopkeeper?{" "}
                    <Link to="/" className="text-blue-600 hover:underline">Register here</Link>
                </p>
            </div>
        </div>
    );
}
