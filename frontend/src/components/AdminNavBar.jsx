import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HomeIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ListBulletIcon,
  ExclamationCircleIcon,
  PhotoIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";

const navs = [
  { name: "Dashboard", path: "/dashboard", icon: <HomeIcon className="w-5 h-5 mr-2" /> },
  { name: "Customer List", path: "/customers", icon: <UsersIcon className="w-5 h-5 mr-2" /> },
  { name: "Revenue", path: "/revenue", icon: <CurrencyRupeeIcon className="w-5 h-5 mr-2" /> },
  { name: "New Bill", path: "/new-bill", icon: <ClipboardDocumentListIcon className="w-5 h-5 mr-2" /> },
  { name: "Bill Status", path: "/bill-status", icon: <CheckCircleIcon className="w-5 h-5 mr-2" /> },
  { name: "Todo List", path: "/todo-list", icon: <ListBulletIcon className="w-5 h-5 mr-2" /> },
  { name: "Overdue Task", path: "/overdue", icon: <ExclamationCircleIcon className="w-5 h-5 mr-2" /> },
  { name: "Designs", path: "/designs", icon: <PhotoIcon className="w-5 h-5 mr-2" /> },
];

export default function AdminNavBar() {
  const { logout } = useAuth();

  return (
    <nav className="w-full bg-gradient-to-r from-[#5C4033] via-[#7B4F35] to-[#A67B5B] shadow-xl px-4 py-4 md:px-10 rounded-b-xl animate-slide-down-nav font-sans z-50">
      <div className="flex flex-wrap gap-3 justify-center md:justify-start items-center relative">
        {/* Logo */}
        <div className="flex items-center gap-3 mr-6">
          <img
            src="https://placehold.co/48x48/5C4033/ffffff?text=SM"
            alt="SewMate"
            className="h-12 w-12 rounded-full border-2 border-[#FDF6EC] shadow-md hover:rotate-6 transform transition duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/48x48/cccccc/333333?text=SM";
            }}
          />
          <h1 className="text-[#FDF6EC] text-xl font-bold tracking-wide drop-shadow-md hidden sm:block">
            SewMate
          </h1>
        </div>

        {/* Navigation Links */}
        {navs.map((nav) => (
          <NavLink
            key={nav.name}
            to={nav.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 
              ${
                isActive
                  ? "bg-[#EED8B4] text-black shadow-lg ring-2 ring-[#FDF6EC]"
                  : "text-[#FDF6EC] hover:bg-[#7B4F35] hover:text-white"
              }`
            }
          >
            {nav.icon}
            {nav.name}
          </NavLink>
        ))}

        {/* Logout */}
        <button
          onClick={logout}
          className="ml-auto flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full bg-[#8B3A3A] text-white shadow-md hover:bg-[#6C2C2C] hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#FDF6EC]"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* Animation CSS */}
      <style>
        {`
        @keyframes slideDownNav {
          0% {
            opacity: 0;
            transform: translateY(-40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down-nav {
          animation: slideDownNav 0.5s ease-out forwards;
        }
        `}
      </style>
    </nav>
  );
}
