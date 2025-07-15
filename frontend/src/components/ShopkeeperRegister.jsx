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
    const [loading, setLoading] = useState(false); // Add loading state
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true); // Set loading to true on form submission

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
                // Clear form after successful registration
                setForm({
                    shop_name: "",
                    owner_name: "",
                    email: "",
                    password: "",
                    mobile: "",
                    address: ""
                });
                setTimeout(() => navigate("/login"), 2000);
            }
        } catch (err) { // Catch network errors
            console.error("Registration fetch error:", err);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false); // Set loading to false after fetch completes
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center px-4 font-inter">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl animate-fade-in-up">
                <div className="flex flex-col items-center mb-6">
                    <img
                        src="https://placehold.co/80x80/93c5fd/1e40af?text=Register"
                        alt="Register Icon"
                        className="h-20 w-20 rounded-full mb-4 shadow-lg border-4 border-blue-200"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x80/cccccc/333333?text=Err'; }}
                    />
                    <h2 className="text-3xl font-bold text-blue-700 text-center animate-fade-in">Create Your Shopkeeper Account</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {[
                        { name: "shop_name", label: "Shop Name", type: "text" },
                        { name: "owner_name", label: "Owner Name", type: "text" },
                        { name: "email", label: "Email", type: "email" },
                        { name: "password", label: "Password", type: "password" },
                        { name: "mobile", label: "Mobile Number", type: "tel", pattern: "[0-9]{10}", title: "Mobile number must be 10 digits" },
                        { name: "address", label: "Shop Address", type: "text" }
                    ].map(({ name, label, type = "text", pattern, title }) => (
                        <div key={name}>
                            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                            <input
                                type={type}
                                name={name}
                                id={name}
                                value={form[name]}
                                onChange={handleChange}
                                required={name !== "address"} // Address is optional
                                autoComplete={name === "password" ? "new-password" : (name === "email" ? "email" : "off")}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 transition-all duration-200 shadow-sm"
                                pattern={pattern}
                                title={title}
                            />
                        </div>
                    ))}

                    {error && (
                        <p className="text-sm text-red-600 bg-red-100 border border-red-300 p-3 rounded-lg animate-slide-down">
                            ❌ {error}
                        </p>
                    )}
                    {success && (
                        <p className="text-sm text-green-600 bg-green-100 border border-green-300 p-3 rounded-lg animate-slide-down">
                            ✅ Registration successful! Redirecting to login...
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full px-4 py-3 rounded-lg font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md
                            ${loading
                                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-75"}`
                        }
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registering...
                            </span>
                        ) : (
                            "Register"
                        )}
                    </button>
                </form>

                <p className="mt-6 text-base text-center text-gray-600">
                    Already have an account?{" "}
                    <Link to="/login" className="text-indigo-600 hover:underline font-semibold transition-colors duration-200">Login here</Link>
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
