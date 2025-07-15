import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ShopkeeperLogin() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

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
                login(data.shopkeeper, data.token);
                navigate("/dashboard");
            }
        } catch (err) {
            console.error("Login fetch error:", err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF0F3] flex items-center justify-center px-4 font-inter">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl animate-fade-in-up">
                <div className="flex flex-col items-center mb-6">
                    <img
                        src="https://placehold.co/80x80/D1A6AD/ffffff?text=Login" // Updated color
                        alt="Login Icon"
                        className="h-20 w-20 rounded-full mb-4 shadow-lg border-4 border-[#C2949D]" // Updated color
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x80/cccccc/333333?text=Err'; }}
                    />
                    <h2 className="text-3xl font-bold text-[#754F4F] text-center animate-fade-in"> {/* Updated color */}
                        Shopkeeper Login
                    </h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {[
                        { name: "email", label: "Email", type: "email" },
                        { name: "password", label: "Password", type: "password" }
                    ].map(({ name, label, type }) => (
                        <div key={name}>
                            <label htmlFor={name} className="block text-sm font-medium text-[#5A3F44] mb-2"> {/* Updated color */}
                                {label}
                            </label>
                            <input
                                type={type}
                                name={name}
                                id={name}
                                value={form[name]}
                                onChange={handleChange}
                                required
                                autoComplete={name === "password" ? "current-password" : "username"}
                                className="w-full px-4 py-3 border border-[#E0C0C6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C2949D] shadow-sm text-[#5A3F44] bg-[#F9E9EC]" // Updated colors
                            />
                        </div>
                    ))}

                    {error && (
                        <p className="text-sm text-red-700 bg-red-100 border border-red-300 p-3 rounded-lg animate-slide-down">
                            ❌ {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full px-4 py-3 rounded-lg font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md
                            ${loading
                                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                : "bg-[#D1A6AD] text-white hover:bg-[#C2949D] focus:outline-none focus:ring-2 focus:ring-[#E0C0C6] focus:ring-opacity-75"}`} {/* Updated colors */}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Logging in...
                            </span>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>

                <p className="mt-6 text-base text-center text-[#754F4F]"> {/* Updated color */}
                    New shopkeeper?{" "}
                    <Link to="/" className="text-[#C2949D] hover:underline font-semibold transition-colors duration-200"> {/* Updated color */}
                        Register here
                    </Link>
                </p>
            </div>

            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.7s ease-out forwards;
                }
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                .animate-slide-down {
                    animation: slideDown 0.5s ease-out forwards;
                }
                `}
            </style>
        </div>
    );
}
