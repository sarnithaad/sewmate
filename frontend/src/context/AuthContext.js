import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the Auth Context
export const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    // Initialize user and token from localStorage on first load
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('shopkeeper');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error("Failed to parse shopkeeper from localStorage:", error);
            return null;
        }
    });
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0); // For dashboard/revenue refresh

    // Effect to sync user/token state to localStorage whenever they change
    useEffect(() => {
        if (user) {
            localStorage.setItem('shopkeeper', JSON.stringify(user));
        } else {
            localStorage.removeItem('shopkeeper');
        }
    }, [user]);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    // Login function
    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        triggerDashboardRefresh(); // Trigger refresh on login
    };

    // Logout function
    const logout = () => {
        setUser(null);
        setToken(null);
        // localStorage is cleared by the useEffects above when user/token become null
    };

    // Function to trigger dashboard/revenue data refresh
    const triggerDashboardRefresh = () => {
        setDashboardRefreshKey(prev => prev + 1);
    };

    const value = {
        user,
        token,
        login,
        logout,
        dashboardRefreshKey,
        triggerDashboardRefresh
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for convenience
export const useAuth = () => {
    return useContext(AuthContext);
};
