# Source Code Structure

This directory contains all the application source code organized according to Karpathy Skills principles.

## Directory Organization

### `components/`
Reusable UI components following **Composition over Inheritance** and **DRY** principles.
- `ui/` - Primitive components (Button, Input, Card, etc.) used throughout the app
- `layout/` - Layout components (Header, Footer, Sidebar, etc.)
- `feature/` - Feature-specific components built by composing primitives

### `screens/`
Application screens following **Simplicity** principle.
Each screen focuses on presentation logic only, delegating business logic to hooks and services.
- Organized by feature area (auth, home, product, etc.)
- Each screen should be as simple as possible while fulfilling its purpose

### `services/`
External service integrations following **Encapsulation** and **Provider-specific Config** principles.
- `supabase/` - Encapsulated Supabase service hiding implementation details
- `api/` - Generic API service layer
- `analytics/` - Analytics service (if needed)
- Services provide clear interfaces without exposing provider-specific details

### `hooks/`
Custom React hooks following **DRY** principle.
Extract and share stateful logic between components.
- Examples: `useAuth.js`, `useApi.js`, `useProducts.js`

### `utils/`
Utility functions following **DRY** principle.
Pure helper functions used throughout the application.
- Formatters, validators, constants, helpers

### `contexts/`
React Context providers following **Encapsulation** principle.
Manage and provide global state to the component tree.
- Examples: `AuthContext.js`, `CartContext.js`

### `types/`
Shared TypeScript definitions following **No Type Ignores** principle.
Centralized type definitions to ensure consistency and type safety.

### `assets/`
Static resources (images, icons, animations).

### `themes/`
Theme configuration (colors, fonts, etc.).

### `navigation/`
React Navigation configuration.

### `__tests__/`
Test structure following **Maximum Test Coverage** principle.
Mirrors the src/ directory structure for test organization.

## Skill Application Guidelines

When adding code to any directory, ask:
1. **Simplicity**: Am I implementing the simplest solution?
2. **DRY**: Am I duplicating logic that could be extracted?
3. **Encapsulation**: Am I hiding implementation details appropriately?
4. **Composition**: Am I building complex from simple rather than deep inheritance?
5. **Provider-Specific**: Am I keeping service configurations isolated?
6. **Dead Code**: Have I removed any unused code or comments?
7. **Platform-Agnostic**: Are my names free from platform specifics?
8. **Types**: Have I fixed type issues rather than ignoring them?
9. **Complete Migration**: If I moved a file, did I update所有 imports?
10. **Testability**: Is this code easy to test?
11. **Cognitive Workflow**: Did I follow ANALYZE→PLAN→EXECUTE→VERIFY?
12. **Preferred Tools**: Am I using appropriate development tools?

Each directory has a clear area of work and responsibility, making it easy to locate and understand code.