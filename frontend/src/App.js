// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";

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

// Helper component to protect routes
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const [user, setUser] = useState(() => {
    // Try to load user from localStorage
    const saved = localStorage.getItem("shopkeeper");
    return saved ? JSON.parse(saved) : null;
  });

  // Sync user state with localStorage changes
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
      {user && <AdminNavBar onLogout={() => setUser(null)} />}
      <Routes>
        {/* Registration page as landing */}
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" /> : <ShopkeeperRegister />
          }
        />
        {/* Login page */}
        <Route
          path="/login"
          element={
            user ? <Navigate to="/dashboard" /> : <ShopkeeperLogin onLogin={setUser} />
          }
        />
        {/* Dashboard and other protected routes */}
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
        {/* Redirect any unknown route to dashboard or login */}
        <Route
          path="*"
          element={
            user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
