import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AUTH_CONFIG, isSessionExpired, updateSessionTimestamp } from '@/config/auth';
import { userDataSync } from '@/lib/userDataSync';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  user: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
      
      if (token && !isSessionExpired()) {
        try {
          // Verify token with server
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            setIsAuthenticated(true);
            setUser(data.user);
            updateSessionTimestamp();
            
            // Initialize sync service after successful authentication
            userDataSync.initialize();
          } else {
            // Token is invalid, clear it
            logout();
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          logout();
        }
      } else {
        // No token or expired session
        logout();
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Auto-refresh session on activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshSession = () => {
      if (!isSessionExpired()) {
        updateSessionTimestamp();
      } else {
        // Session expired, logout
        logout();
      }
    };

    // Refresh session on user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const throttledRefresh = throttle(refreshSession, 60000); // Throttle to once per minute

    activityEvents.forEach(event => {
      document.addEventListener(event, throttledRefresh, true);
    });

    // Also refresh every 5 minutes regardless of activity
    const interval = setInterval(() => {
      if (isAuthenticated && !isSessionExpired()) {
        updateSessionTimestamp();
      } else if (isAuthenticated) {
        logout();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, throttledRefresh, true);
      });
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  // Throttle function to limit how often we update the session
  const throttle = (func: Function, limit: number) => {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store authentication data
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, data.token);
        localStorage.setItem(AUTH_CONFIG.USER_KEY, data.user);
        updateSessionTimestamp();
        
        setIsAuthenticated(true);
        setUser(data.user);
        
        // Initialize sync service after successful login
        userDataSync.initialize();
        
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    
    // Try to logout from server
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }
    
    // Clear authentication data
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    localStorage.removeItem(AUTH_CONFIG.SESSION_TIMESTAMP_KEY);
    
    // Stop sync service
    userDataSync.stopAutoSync();
    
    setIsAuthenticated(false);
    setUser(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 