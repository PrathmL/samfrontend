import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                // Set default auth header if token exists
                if (parsedUser.token) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
                }
            } catch (e) {
                console.error('Failed to parse user from localStorage', e);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (mobileNumber, password) => {
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                mobileNumber,
                password
            });
            
            const userData = response.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            
            if (userData.token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
            }
            
            return userData;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
    }, []);

    const value = useMemo(() => ({
        user,
        login,
        logout,
        loading
    }), [user, login, logout, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
