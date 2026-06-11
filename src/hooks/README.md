# Custom Hooks

This directory contains reusable React hooks that follow the **DRY** (Don't Repeat Yourself) principle.

## Purpose

Custom hooks allow us to extract and share stateful logic between components without duplicating code.

## Design Principles

### DRY Principle
- If you find yourself using the same state logic in multiple components, extract it to a hook
- Examples: data fetching, authentication state, form validation, etc.
- This reduces bugs and makes changes easier to implement in one place

### Encapsulation Principle
- Hooks should hide implementation details and expose only what's necessary
- A hook might use multiple services or context internally but provide a simple API
- Example: `useAuth()` hook might use Supabase service and AuthContext but only expose `user`, `login()`, `logout()`, etc.

### Simplicity Principle
- Hooks should do one thing well
- Prefer multiple small hooks over one large hook that does everything
- Example: Separate `useApi()` for data fetching and `useForm()` for form state rather than one massive hook

## Hook Categories

### Data Fetching Hooks
- `useApi.js` - Generic API data fetching hook
- `useProducts.js` - Product-specific data fetching
- `useOrders.js` - Order-specific data fetching
- etc.

### State Management Hooks
- `useAuth.js` - Authentication state management
- `useCart.js` - Shopping cart state management
- `useForm.js` - Generic form state handling
- etc.

### UI/UX Hooks
- `useModal.js` - Modal open/close state
- `useNavigation.js` - Navigation helpers
- `useBreakpoint.js` - Responsive design helpers
- etc.

## Usage Guidelines

1. **Name hooks with "use" prefix** - This is a React convention that enables proper linting
2. **Keep hooks focused** - Each hook should solve one specific problem
3. **Return stable values** - Use useCallback and useMemo appropriately to prevent unnecessary re-renders
4. **Handle errors gracefully** - Hooks should manage their own error states
5. **Make hooks testable** - Extract complex logic to pure functions when possible
6. **Document assumptions** - Clearly state what the hook expects and what it returns
7. **Follow React Rules of Hooks** - Only call hooks at the top level and in React functions

## Example: useApi.js

```javascript
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export function useApi(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await apiService.get(endpoint, options);
        if (isMounted) {
          setData(result.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'An error occurred');
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [endpoint, JSON.stringify(options)]);

  return { data, loading, error };
}
```

This hook encapsulates the data fetching logic that would otherwise be duplicated in multiple components.

## Testing Hooks

Custom hooks should be tested using React Hooks Testing Library or similar tools.
Tests should cover:
- Loading states
- Data success cases
- Error cases
- Cleanup on unmount
- Parameter changes triggering refetch