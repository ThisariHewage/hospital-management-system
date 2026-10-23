import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { getRoleDashboard } from '../utils/rbacConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verify session on app initialization using HTTP-only cookie
    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            try {
                const response = await api.get('/auth/me');
                if (isMounted && response.data?.user) {
                    setUser(response.data.user);
                } else if (isMounted) {
                    setUser(null);
                }
            } catch (err) {
                if (isMounted) {
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        checkAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    /**
     * Authenticates credentials or registers new user if not yet in database.
     * Validates username, custom password, and chosen role.
     */
    const login = async (identifier, password, role) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', {
                username: identifier,
                password,
                role
            });

            const authenticatedUser = response.data.user;
            setUser(authenticatedUser);

            const dashboardRoute = authenticatedUser.dashboardRoute || getRoleDashboard(authenticatedUser.role);

            return {
                success: true,
                user: authenticatedUser,
                dashboardRoute
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Authentication failed. Please check your credentials.'
            };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Registers a new user as pending (does NOT issue JWT or set user state).
     * Returns { success, pending, message } from the server.
     */
    const register = async (username, password, role) => {
        try {
            const response = await api.post('/auth/register', { username, password, role });
            return {
                success: true,
                pending: response.data.pending,
                message: response.data.message
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed. Please try again.'
            };
        }
    };

    /**
     * Clears all users in MySQL database and resets session
     */
    const clearDatabaseUsers = async () => {
        try {
            const response = await api.post('/auth/clear-users');
            setUser(null);
            return { success: true, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to clear users.'
            };
        }
    };

    /**
     * Clears user session cookie on server and resets frontend user state.
     */
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                role: user?.role || null,
                isAuthenticated: !!user,
                loading,
                login,
                register,
                logout,
                clearDatabaseUsers
            }}
        >
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

export default AuthContext;
