import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Decode JWT payload without a library (base64url decode)
function decodeTokenPayload(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeTokenPayload(token);
  if (!payload || !payload.exp) return true;
  // Add 10 second buffer for clock skew
  return Date.now() >= (payload.exp * 1000) - 10000;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('admin_token');
    // Immediately reject expired tokens on initial load
    if (stored && isTokenExpired(stored)) {
      localStorage.removeItem('admin_token');
      return null;
    }
    return stored;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  useEffect(() => {
    if (token) {
      localStorage.setItem('admin_token', token);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('admin_token');
      setIsAuthenticated(false);
    }
  }, [token]);

  // Periodically check token expiration (every 60 seconds)
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      if (isTokenExpired(token)) {
        console.warn('Admin token expired, logging out.');
        setToken(null);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [token]);

  const login = async (password) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const error = new Error(data.error || 'Invalid password');
      error.status = response.status;
      error.attemptsRemaining = data.attemptsRemaining;
      error.retryAfter = data.retryAfter;
      error.lockedUntil = data.lockedUntil;
      throw error;
    }

    const data = await response.json();
    setToken(data.token);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
