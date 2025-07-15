import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import useAuth hook

const navs = [
    { name: "Dashboard", path: "/dashboard" }, // Corrected path to /dashboard
    { name: "Customer List", path: "/customers" },
    { name: "Revenue", path: "/revenue" },
    { name: "New Bill", path: "/new-bill" },
    { name: "Bill Status", path: "/bill-status" },
    { name: "Todo List", path: "/todo-list" },
    { name: "Overdue Task", path: "/overdue" },
    { name: "Designs", path: "/designs" }
];

export default function AdminNavBar() {
    const { logout } = useAuth(); // Get logout function from AuthContext

    return (
        <nav className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg px-4 py-3 md:px-8 rounded-b-lg animate-slide-down-nav font-inter">
            <div className="flex flex-wrap gap-2 justify-center md:justify-start items-center relative">
                {/* Logo Placeholder */}
                <img
                    src="https://placehold.co/40x40/ffffff/000000?text=Logo"
                    alt="Company Logo"
                    className="h-10 w-10 rounded-full border-2 border-white mr-4 shadow-md"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/cccccc/333333?text=Err'; }}
                />

                {navs.map((nav) => (
                    <NavLink
                        key={nav.name}
                        to={nav.path}
                        className={({ isActive }) =>
                            `px-4 py-2 text-sm font-semibold rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg
                            ${isActive
                                ? "bg-white text-blue-700 shadow-md ring-2 ring-blue-300"
                                : "text-white hover:bg-blue-500 hover:text-white"}`
                        }
                    >
                        {nav.name}
                    </NavLink>
                ))}
                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="ml-auto px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 ease-in-out bg-red-500 text-white shadow-md hover:bg-red-600 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-75"
                >
                    Logout
                </button>
            </div>
            {/* Basic CSS for animations (can be moved to index.css or a dedicated styles file) */}
            <style>
                {`
                @keyframes slideDownNav {
                    from { opacity: 0; transform: translateY(-50px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-down-nav {
                    animation: slideDownNav 0.6s ease-out forwards;
                }
                `}
            </style>
        </nav>
    );
}
