// hooks/useAuth.js
import { useEffect, useState } from 'react';
import axios from '../utils/axios';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('users/me', {
          withCredentials: true,
        });
        setIsAuthenticated(true);
        setUserRole(response.data.user_role); // Match your database column name
      } catch (error) {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };
    checkAuth();
  }, []);

  return { isAuthenticated, userRole };
};