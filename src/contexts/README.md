# React Contexts

This directory contains React Context providers that follow the **Encapsulation** principle.

## Purpose

React Context provides a way to pass data through the component tree without having to pass props down manually at every level.

## Design Principles

### Encapsulation Principle
- Contexts should hide implementation details and expose only what's necessary
- The context provider manages state internally but provides a clean API for consumers
- Components that use the context don't need to know how the state is managed internally
- Example: AuthContext manages authentication state but only exposes `user`, `login()`, `logout()`, etc.

### Simplicity Principle
- Each context should have a single, well-defined responsibility
- Prefer multiple focused contexts over one large context that manages everything
- Example: Separate AuthContext for authentication and CartContext for shopping cart rather than one massive AppContext

### No Type Ignores Principle
- All context values and setter functions should have proper TypeScript definitions
- Use TypeScript to ensure type safety between providers and consumers

## Common Context Patterns

### State Context
Manages a piece of state and provides setter functions
- Example: ThemeContext for managing light/dark mode
- Provides: `theme` (light/dark) and `setTheme()` function

### Action Context
Provides functions to perform actions without exposing state
- Example: NotificationContext for showing toast notifications
- Provides: `showSuccess()`, `showError()`, `showInfo()` functions

### Hybrid Context
Manages state and provides related actions
- Example: AuthContext manages user state and provides login/logout actions
- Provides: `user` object and `login()`, `logout()`, `updateProfile()` functions

### Read-Only Context
Provides immutable data or configuration
- Example: ConfigContext provides application configuration
- Provides: read-only configuration object

## Context Structure

Each context typically consists of:
1. **Context Definition** - Created with `React.createContext(defaultValue)`
2. **Provider Component** - Wraps components that need access to the context
3. **Custom Hook** - Optional but recommended hook to consume the context (e.g., `useAuth()`)
4. **Type Definitions** - TypeScript interfaces for the context value

## Usage Guidelines

1. **Always provide a default value** - Helps catch components used outside of Provider
2. **Create a custom hook** - Makes consuming context cleaner and handles errors
3. **Keep context values stable** - Use useMemo/useCallback to prevent unnecessary re-renders
4. **Split concerns** - Don't put unrelated state in the same context
5. **Consider performance** - Large context values can cause excessive re-renders
6. **Document the API** - Clearly document what the context provides
7. **Follow React Rules of Hooks** - Context consumers must follow hook rules
8. **Test context providers** - Ensure they provide correct values and handle edge cases

## Example: AuthContext.js

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

// Define the context value shape
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// Create context with default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for consuming context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userData = await authService.login(email, password);
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true);
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const contextValue = {
    user,
    loading,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
```

## Testing Contexts

Context providers should be tested by:
1. Rendering components wrapped in the provider
2. Testing the custom hook (`useAuth()`) in isolation
3. Verifying state updates and action functions work correctly
4. Testing edge cases like error conditions