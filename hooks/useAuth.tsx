import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';
import { TokenManager } from '../utils/api';

interface User {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, passwordConfirmation: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:3000/api/v1';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenManager = TokenManager.getInstance();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await tokenManager.getValidToken();
      const storedUser = await SecureStore.getItemAsync('auth_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const storeAuth = async (newToken: string, newUser: User) => {
    try {
      await tokenManager.storeToken(newToken);
      // Ensure newUser is properly stringified before storing
      const userString = typeof newUser === 'string' ? newUser : JSON.stringify(newUser);
      await SecureStore.setItemAsync('auth_user', userString);
      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      console.error('Error storing auth:', error);
      throw error;
    }
  };

  const clearAuth = async () => {
    try {
      await tokenManager.clearToken();
      await SecureStore.deleteItemAsync('auth_user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error clearing auth:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: { email, password }
        }),
      });

      if (!response.ok) {
        // Handle 401 specifically for authentication failures
        if (response.status === 401) {
          throw new Error('Invalid email or password. Please try again.');
        }

        // Try to parse JSON error response
        try {
          const errorData = await response.json();
          throw new Error(errorData.status?.message || 'Sign in failed');
        } catch (parseError) {
          // If JSON parsing fails, throw a generic error
          throw new Error('Sign in failed. Please try again.');
        }
      }

      const data = await response.json();
      const authToken = response.headers.get('Authorization')?.replace('Bearer ', '');

      if (!authToken) {
        throw new Error('No authentication token received');
      }

      // Extract the user object from the correct path in the response
      const userData = data.status?.data?.user || data.data?.user || data.user;
      if (!userData) {
        throw new Error('Invalid response format from server');
      }

      await storeAuth(authToken, userData);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, passwordConfirmation: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: { email, password, password_confirmation: passwordConfirmation }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.status?.message || 'Sign up failed');
      }

      const data = await response.json();
      const authToken = response.headers.get('Authorization')?.replace('Bearer ', '');

      if (!authToken) {
        throw new Error('No authentication token received');
      }

      // Extract the user object from the correct path in the response
      const userData = data.status?.data?.user || data.data?.user || data.user;
      if (!userData) {
        throw new Error('Invalid response format from server');
      }

      await storeAuth(authToken, userData);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (token) {
        // Revoke token on backend
        await fetch(`${API_BASE_URL}/logout`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      await clearAuth();
    }
  };

  const value = {
    user,
    token,
    isLoading,
    signIn,
    signUp,
    signOut,
    clearAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};