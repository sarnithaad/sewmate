// src/App.js
import React, { useState } from "react";
import WelcomePage from "./components/WelcomePage";
import AdminNavBar from "./components/AdminNavBar";
import Dashboard from "./components/Dashboard";
import CustomerList from "./components/CustomerList";
import Revenue from "./components/Revenue";
import NewBill from "./components/NewBill";
import BillStatus from "./components/BillStatus";
import TodoList from "./components/TodoList";
import OverdueTask from "./components/OverdueTask";
import Designs from "./components/Designs";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    // Show welcome/login page if not logged in
    return <WelcomePage onLogin={setUser} />;
  }

  return (
    <Router>
      <AdminNavBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/new-bill" element={<NewBill />} />
        <Route path="/bill-status" element={<BillStatus />} />
        <Route path="/todo-list" element={<TodoList />} />
        <Route path="/overdue" element={<OverdueTask />} />
        <Route path="/designs/*" element={<Designs />} />
        {/* Redirect any unknown route to dashboard */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
