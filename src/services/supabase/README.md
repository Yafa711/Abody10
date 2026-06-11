# Supabase Service

This directory encapsulates all Supabase-specific functionality following the **Encapsulation** and **Provider-specific Config** principles.

## Design Principles

### Encapsulation
- Details of Supabase implementation are hidden from the rest of the application
- Components interact with this service through a clear, simple interface
- If we ever need to change the backend provider (e.g., to Firebase), only this service needs to change

### Provider-Specific Config
- All Supabase configuration (URL, anon key) is contained within this service
- No Supabase-specific code leaks into business logic, hooks, or components
- The service reads configuration from environment variables and provides a clean interface

## Service Structure

### SupabaseService Class
A singleton class that wraps the Supabase client and provides typed methods for common operations.

### Individual Resource Services
For complex entities, we might have dedicated services:
- `ProductService.js` - for product-related operations
- `OrderService.js` - for order-related operations
- `UserService.js` - for user-related operations
- etc.

Each would use the SupabaseService internally but provide domain-specific methods.

## Usage Example

Instead of this in components:
```javascript
// ❌ Wrong: Supabase details leak into component
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('category', categoryId);
```

We use this:
```javascript
// ✅ Right: Clean interface without Supabase details
const products = await productService.getByCategory(categoryId);
```

## Implementation Guidelines

1. **Never expose the raw Supabase client** to components or hooks
2. **Always return domain-specific data shapes** from service methods
3. **Handle Supabase-specific errors internally** and convert to application errors
4. **Keep all Supabase initialization logic** in this service
5. **Follow the same patterns** as other services in the `services/` directory
6. **Add methods only as needed** - YAGNI (You Aren't Gonna Need It) principle
7. **Write methods that are easy to test** - they should be pure functions of their inputs