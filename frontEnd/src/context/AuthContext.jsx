import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                setUser(JSON.parse(storedUser));
                // Fetch the latest user data if authenticated
                try {
                    await refreshUserProfile();
                } catch (error) {
                    console.error('Failed to refresh user profile:', error);
                }
            }

            setLoading(false);
        };

        initializeAuth();
    }, []);

    const refreshUserProfile = async () => {
        try {
            const response = await axios.get('/users/me');
            const updatedUserData = response.data;
            
            // Update the user state with the latest profile data
            setUser(updatedUserData);
            
            // Update the stored user data
            localStorage.setItem('user', JSON.stringify(updatedUserData));
            
            return updatedUserData;
        } catch (error) {
            console.error('Error refreshing user profile:', error);
            throw error;
        }
    };

    const updateUserProfile = async (profileData) => {
        try {
            const response = await axios.put('users/profile', profileData);
            const updatedUserData = response.data.user;
            
            // Update the user state with the updated profile data
            setUser(prevUser => ({
                ...prevUser,
                ...updatedUserData
            }));
            
            // Update the stored user data
            localStorage.setItem('user', JSON.stringify({
                ...user,
                ...updatedUserData
            }));
            
            return updatedUserData;
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    };

    const updateProfilePicture = async (formData) => {
        try {
            const response = await axios.post('users/profile-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            const profilePicture = response.data.profilePicture;
            
            // Update the user state with the new profile picture
            setUser(prevUser => ({
                ...prevUser,
                profile_picture: profilePicture
            }));
            
            // Update the stored user data
            localStorage.setItem('user', JSON.stringify({
                ...user,
                profile_picture: profilePicture
            }));
            
            return profilePicture;
        } catch (error) {
            console.error('Error updating profile picture:', error);
            throw error;
        }
    };

    const login = async (email, password, remember_me) => {
        const response = await axios.post('users/login', {
            email,
            password,
            remember_me
        });

        const { token, ...userData } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = async () => {
        try {
            await axios.post('users/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        refreshUserProfile,
        updateUserProfile,
        updateProfilePicture,
        isAuthenticated: !!user,
        hasRole: (role) => user?.role === role
    };

    if (loading) {
        return <div>Loading...</div>;
    }

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

export { AuthContext }; 