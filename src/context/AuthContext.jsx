import { createContext, useContext, useState, useEffect } from 'react';
import * as authAPI from '../api/auth';

// Create AuthContext using React Context.
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, call me() if token exists.
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Validate token by calling me()
      authAPI
        .me()
        .then((response) => {
          if (response.user) {
            setUser(response.user);
          }
        })
        .catch(() => {
          // Token is invalid, remove it
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Provide login() method that uses auth API.
  const login = async (data) => {
    try {
      const response = await authAPI.login(data);
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.user);
        return { success: true, user: response.user };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Provide googleLogin() method
  const googleLogin = async (token, role) => {
    try {
      const response = await authAPI.googleLogin(token, role);
      if (response.success && response.token && response.user) {
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.user);
        return { success: true, user: response.user };
      }
      // Handle cases where user is pending or deactivated (though api/auth.js usually handles error message)
      return { success: false, error: response.error || 'Google Login failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Provide logout() method
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Provide register() method that uses auth API.
  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      if (response.success && response.token && response.user) {
        // If we got a token and user (auto-login enabled from backend for this role/status)
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.user);
        return { success: true, user: response.user };
      } else if (response.user) {
        // Registration successful but no token (e.g. pending approval)
        return { success: true, user: response.user };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }

  };

  // Helper to update user state without API call (e.g. after profile update)
  const updateUser = (userData, newToken = null) => {
    setUser(userData);
    if (newToken) {
      setToken(newToken);
      localStorage.setItem('token', newToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        googleLogin,
        logout,
        register,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export useAuth hook.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
