import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthWrapper = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        const userInfo = localStorage.getItem('user_info');

        if (token && userInfo) {
            try {
                const userData = JSON.parse(userInfo);
                // Normalize role để đảm bảo consistency
                if (userData) {
                    const rawRole = userData.Role || userData.role || '';
                    const normalizedRole = String(rawRole).toLowerCase().trim();
                    // Giữ cả Role và role để tương thích
                    userData.Role = normalizedRole;
                    userData.role = normalizedRole;
                }
                setIsAuthenticated(true);
                setUser(userData);
                console.log(' Auth context initialized - user role:', userData?.Role || userData?.role);
            } catch (error) {
                console.error('Error parsing user info:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user_info');
            }
        }
        setLoading(false);
    }, []);

    const setAuth = (auth, userData = null) => {
        setIsAuthenticated(auth);
        // Normalize role khi set user data
        if (userData) {
            const rawRole = userData.Role || userData.role || '';
            const normalizedRole = String(rawRole).toLowerCase().trim();
            // Giữ cả Role và role để tương thích
            userData.Role = normalizedRole;
            userData.role = normalizedRole;
        }
        setUser(userData);
        if (!auth) {
            localStorage.removeItem('token');
            localStorage.removeItem('user_info');
        } else if (userData) {
            localStorage.setItem('user_info', JSON.stringify(userData));
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user_info');
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            user,
            setAuth,
            logout,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

