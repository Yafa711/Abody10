# Navigation

This directory contains React Navigation configuration following the **Simplicity** and **Composition** principles.

## Purpose

React Navigation handles screen transitions and navigation state in the application.

## Design Principles

### Simplicity Principle
- Navigation structure should be as simple as possible while meeting requirements
- Avoid overly complex nested navigators when simpler alternatives exist
- Example: Using bottom tabs for primary navigation and stack navigators for secondary flows

### Composition Principle
- Build complex navigation from simpler navigators
- Example: Stack navigator inside a bottom tab for specific sections
- Reuse navigator configurations when possible

### Platform-Agnostic Naming Principle
- Use generic route names not tied to specific platforms
- Example: Use `PROFILE` instead of `ANDROID_PROFILE_SCREEN`
- This makes it easier to adapt to different platforms if needed

### Encapsulation Principle
- Navigation configuration should be isolated from business logic
- Screens should receive navigation props but not depend on navigation implementation
- Example: Pass navigation callbacks as props rather than passing the navigation object directly

## Navigation Structure

The app typically uses a combination of:
1. **Root Navigator** - Handles authentication state switching (auth vs app)
2. **Auth Navigator** - Stack navigator for authentication flows (login, register, etc.)
3. **App Navigator** - Main app navigator (usually bottom tabs with stacks inside)
4. **Modal Navigator** - For presenting modals (if needed)

## Usage Guidelines

1. **Keep navigators focused** - Each navigator should have a clear purpose
2. **Use consistent naming** - Follow the ROUTES constants from utils/constants.js
3. **Separate concerns** - Don't put business logic in navigation configuration
4. **Optimize performance** - Use React.memo, useCallback, etc. where appropriate
5. **Handle deep linking** - Configure linking for push notifications and external links
6. **Test navigation flows** - Ensure users can navigate between all required screens
7. **Follow platform conventions** - Use tab navigation on Android/iOS as appropriate
8. **Consider web behavior** - Ensure navigation works well in web mode if applicable

## Example Structure

```
RootNavigator (switches based on auth state)
├── AuthNavigator (stack)
│   ├── LoadingScreen
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── ForgetPasswordScreen
└── AppNavigator (bottom tabs)
    ├── HomeTab (stack)
    │   ├── HomeScreen
    │   ├── ProductListScreen
    │   └── ProductDetailsScreen
    ├── CartTab (stack)
    │   └── CartScreen
    ├── ProfileTab (stack)
    │   ├── ProfileScreen
    │   ├── OrderHistoryScreen
    │   └── EditProfileScreen
    └── MoreTab (stack)
        ├── SettingsScreen
        ├── HelpScreen
        └── AboutScreen
```

## Implementation Guidelines

1. **Import screens lazily** - Use React.lazy and Suspense for better startup performance
2. **Use route constants** - Import from utils/constants.js to ensure consistency
3. **Pass navigation helpers as props** - Rather than passing navigation object directly
4. **Handle Android back button** - Use BackHandler for proper back button behavior
5. **Focus inputs when screen appears** - Use focus() on text inputs when appropriate
6. **Share common styles** - Create reusable header styles, button styles, etc.
7. **Handle modals properly** - Use modal navigators or present modals appropriately
8. **Consider accessibility** - Ensure proper labels and touch targets
9. **Test on real devices** - Navigation feel is important for UX
10. **Monitor navigation events** - Use navigation events for analytics if needed

## Route Names

Following the platform-agnostic naming principle, route names should be generic:
- `HOME` - Home screen
- `PRODUCT_LIST` - Product listing screen
- `PRODUCT_DETAILS` - Product details screen
- `CART` - Shopping cart screen
- `PROFILE` - User profile screen
- `SETTINGS` - Settings screen
- etc.

See `src/utils/constants.js` for the complete ROUTES object.