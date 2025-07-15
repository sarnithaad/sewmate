import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import useAuth hook

export default function ShopkeeperLogin() { // No longer accepts onLogin prop
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); // Add loading state
    const navigate = useNavigate();
    const { login } = useAuth(); // Get the login function from AuthContext

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true); // Set loading to true on form submission

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
                // This handles setting localStorage for user and token
                login(data.shopkeeper, data.token);
                navigate("/dashboard");
            }
        } catch (err) {
            console.error("Login fetch error:", err); // Log the actual error
            setError("Network error. Please try again.");
        } finally {
            setLoading(false); // Set loading to false after fetch completes
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4 font-inter">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl animate-fade-in-up">
                <div className="flex flex-col items-center mb-6">
                    <img
                        src="https://placehold.co/80x80/6ee7b7/10b981?text=Login"
                        alt="Login Icon"
                        className="h-20 w-20 rounded-full mb-4 shadow-lg border-4 border-green-200"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x80/cccccc/333333?text=Err'; }}
                    />
                    <h2 className="text-3xl font-bold text-green-700 text-center animate-fade-in">Shopkeeper Login</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {[
                        { name: "email", label: "Email", type: "email" },
                        { name: "password", label: "Password", type: "password" }
                    ].map(({ name, label, type }) => (
                        <div key={name}>
                            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                            <input
                                type={type}
                                name={name}
                                id={name}
                                value={form[name]}
                                onChange={handleChange}
                                required
                                autoComplete={name === "password" ? "current-password" : "username"}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-green-400 transition-all duration-200 shadow-sm"
                            />
                        </div>
                    ))}

                    {error && (
                        <p className="text-sm text-red-600 bg-red-100 border border-red-300 p-3 rounded-lg animate-slide-down">
                            ❌ {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full px-4 py-3 rounded-lg font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md
                            ${loading
                                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-75"}`
                        }
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </span>
                        ) : (
                            "Login"
                        )}
                    </button>
                </form>

                <p className="mt-6 text-base text-center text-gray-600">
                    New shopkeeper?{" "}
                    <Link to="/" className="text-blue-600 hover:underline font-semibold transition-colors duration-200">Register here</Link>
                </p>
            </div>
            {/* Basic CSS for animations (can be moved to index.css or a dedicated styles file) */}
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
