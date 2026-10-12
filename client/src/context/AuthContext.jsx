import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({
        id: 1,
        username: 'admin',
        role: 'ADMIN',
        email: 'admin@hospital.com'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('/auth/me');
                if (response.data?.user) {
                    setUser(response.data.user);
                }
            } catch (err) {
                // Fallback or unauthenticated
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { username, password });
            setUser(response.data.user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed. Please check credentials.'
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
        }
    };

    // Demo role switcher for instant preview of any persona
    const switchDemoRole = (newRole) => {
        const roleProfiles = {
            ADMIN: { id: 1, username: 'admin', role: 'ADMIN', email: 'admin@hospital.com', title: 'System Administrator' },
            DOCTOR: { id: 2, username: 'dr_smith', role: 'DOCTOR', email: 'smith@hospital.com', title: 'Dr. Robert Smith (Cardiology)' },
            NURSE: { id: 4, username: 'nurse_joy', role: 'NURSE', email: 'joy@hospital.com', title: 'Nurse Joy Carter' },
            RECEPTIONIST: { id: 5, username: 'reception_alex', role: 'RECEPTIONIST', email: 'alex@hospital.com', title: 'Alex Rivera (Reception)' },
            LAB_STAFF: { id: 6, username: 'lab_david', role: 'LAB_STAFF', email: 'david@hospital.com', title: 'David Chen (Lab Tech)' },
            PHARMACIST: { id: 7, username: 'pharma_emma', role: 'PHARMACIST', email: 'emma@hospital.com', title: 'Emma Watson (Pharmacist)' },
            ACCOUNTANT: { id: 8, username: 'account_marcus', role: 'ACCOUNTANT', email: 'marcus@hospital.com', title: 'Marcus Brody (Accountant)' }
        };

        if (roleProfiles[newRole]) {
            setUser(roleProfiles[newRole]);
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
                logout,
                switchDemoRole
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
