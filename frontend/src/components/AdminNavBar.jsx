import { NavLink } from "react-router-dom";

const navs = [
  {name: "Dashboard", path:"/ShopkeeperDashboard"},
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
    <nav className="flex space-x-2 bg-blue-100 p-3">
      {navs.map(nav => (
        <NavLink
          key={nav.name}
          to={nav.path}
          className={({ isActive }) =>
            isActive
              ? "bg-blue-500 text-white px-4 py-2 rounded"
              : "hover:bg-blue-200 px-4 py-2 rounded"
          }
        >
          {nav.name}
        </NavLink>
      ))}
    </nav>
  );
}
