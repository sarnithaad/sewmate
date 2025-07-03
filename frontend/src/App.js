// src/App.js
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import AdminNavBar from "./components/AdminNavBar";
import ShopkeeperRegister from "./components/ShopkeeperRegister";
import ShopkeeperLogin from "./components/ShopkeeperLogin";
import ShopkeeperDashboard from "./components/ShopkeeperDashboard";
import CustomerList from "./components/CustomerList";
import Revenue from "./components/Revenue";
import NewBill from "./components/NewBill";
import BillStatus from "./components/BillStatus";
import TodoList from "./components/TodoList";
import OverdueTask from "./components/OverdueTask";
import Designs from "./components/Designs";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Protect routes
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("shopkeeper");
    return saved ? JSON.parse(saved) : null;
  });

  // Sync localStorage with state
  useEffect(() => {
    if (user) {
      localStorage.setItem("shopkeeper", JSON.stringify(user));
    } else {
      localStorage.removeItem("shopkeeper");
      localStorage.removeItem("token");
    }
  }, [user]);

  return (
    <Router>
      <ScrollToTop />
      {/* Show NavBar only when logged in and not on login/register */}
      {user && <AdminNavBar onLogout={() => setUser(null)} />}

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          {/* Landing (Register) */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" /> : <ShopkeeperRegister />}
          />
          {/* Login */}
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" /> : <ShopkeeperLogin onLogin={setUser} />}
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <ShopkeeperDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <PrivateRoute>
                <CustomerList />
              </PrivateRoute>
            }
          />
          <Route
            path="/revenue"
            element={
              <PrivateRoute>
                <Revenue />
              </PrivateRoute>
            }
          />
          <Route
            path="/new-bill"
            element={
              <PrivateRoute>
                <NewBill />
              </PrivateRoute>
            }
          />
          <Route
            path="/bill-status"
            element={
              <PrivateRoute>
                <BillStatus />
              </PrivateRoute>
            }
          />
          <Route
            path="/todo-list"
            element={
              <PrivateRoute>
                <TodoList />
              </PrivateRoute>
            }
          />
          <Route
            path="/overdue"
            element={
              <PrivateRoute>
                <OverdueTask />
              </PrivateRoute>
            }
          />
          <Route
            path="/designs/*"
            element={
              <PrivateRoute>
                <Designs />
              </PrivateRoute>
            }
          />

          {/* Catch all */}
          <Route
            path="*"
            element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
