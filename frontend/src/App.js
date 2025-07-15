// src/App.js
import React, { useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext"; // Import AuthProvider and useAuth

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

// Protect routes - now uses AuthContext
function PrivateRoute({ children }) {
    const { user, token } = useAuth(); // Get user and token from AuthContext
    // Check both user object and token for robust authentication check
    return user && token ? children : <Navigate to="/login" />;
}

function AppContent() { // Renamed App to AppContent to wrap with AuthProvider
    const { user, logout, triggerDashboardRefresh } = useAuth(); // Get user and logout from AuthContext

    return (
        <Router>
            <ScrollToTop />
            {/* Show NavBar only when 'user' is logged in */}
            {user && <AdminNavBar onLogout={logout} />} {/* Pass logout function */}

            <main className="max-w-6xl mx-auto px-4 py-6">
                <Routes>
                    {/* Landing (Register) */}
                    <Route
                        path="/"
                        element={user ? <Navigate to="/dashboard" /> : <ShopkeeperRegister />}
                    />
                    {/* Login - No need to pass onLogin prop explicitly, useAuth handles it */}
                    <Route
                        path="/login"
                        element={user ? <Navigate to="/dashboard" /> : <ShopkeeperLogin />}
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
                                {/* Pass triggerDashboardRefresh to NewBill */}
                                <NewBill onBillSaved={triggerDashboardRefresh} />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/bill-status"
                        element={
                            <PrivateRoute>
                                {/* Pass triggerDashboardRefresh to BillStatus */}
                                <BillStatus onStatusUpdated={triggerDashboardRefresh} />
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

                    {/* Catch all - Redirect based on 'user' state */}
                    <Route
                        path="*"
                        element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
                    />
                </Routes>
            </main>
        </Router>
    );
}

// Wrap AppContent with AuthProvider
export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
