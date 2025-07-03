import { NavLink } from "react-router-dom";

const navs = [
  { name: "Dashboard", path: "/ShopkeeperDashboard" },
  { name: "Customer List", path: "/customers" },
  { name: "Revenue", path: "/revenue" },
  { name: "New Bill", path: "/new-bill" },
  { name: "Bill Status", path: "/bill-status" },
  { name: "Todo List", path: "/todo-list" },
  { name: "Overdue Task", path: "/overdue" },
  { name: "Designs", path: "/designs" }
];

export default function AdminNavBar() {
  return (
    <nav className="w-full bg-white shadow-md px-4 py-3 md:px-8">
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        {navs.map((nav) => (
          <NavLink
            key={nav.name}
            to={nav.path}
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 
              ${isActive
                ? "bg-blue-600 text-white shadow-md"
                : "text-blue-700 hover:bg-blue-100 hover:text-blue-900"}`
            }
          >
            {nav.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
