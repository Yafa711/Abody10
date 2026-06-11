# NewElectroStore

A comprehensive Android e-commerce application built with Expo, React Native, and TypeScript, following Karpathy Skills principles for clean, maintainable, and reliable code.

## Project Overview

NewElectroStore is a full-featured e-commerce application designed to provide an excellent user experience while maintaining code quality through principled development practices.

## Features

- **Authentication**: Secure user authentication with Supabase
- **Product Catalog**: Browse and search products
- **Shopping Cart**: Add/remove items, manage quantities
- **User Profile**: Manage account information and order history
- **Admin Dashboard**: (Optional) Manage products, orders, and users
- **Responsive Design**: Optimized for mobile devices
- **Offline Support**: Basic offline functionality
- **Internationalization**: Ready for multiple languages (Arabic/English)

## Technical Stack

- **Framework**: Expo SDK 50 with React Native
- **Language**: TypeScript with strict type checking
- **State Management**: React Context and custom hooks
- **Navigation**: React Navigation (native stack and bottom tabs)
- **Backend**: Supabase (authentication, database, storage)
- **Build**: EAS (Expo Application Services)
- **Testing**: Jest framework configured

## Development Principles

This project strictly adheres to the Karpathy Skills principles outlined in `CLAUDE.md`:

1. **Simplicity**: Always choose the simplest solution that works
2. **DRY**: Extract repeated logic into reusable hooks, components, and utilities
3. **Encapsulation**: Hide implementation details behind clear interfaces
4. **Composition over Inheritance**: Build complex UIs from simple components
5. **Provider-Specific Config**: Keep service configurations isolated
6. **Dead Code Removal**: Regularly remove unused code and comments
7. **Platform-Agnostic Naming**: Use generic names in shared code
8. **No Type Ignores**: Fix type issues instead of ignoring them
9. **Complete Migrations**: Update all imports when moving files
10. **Maximum Test Coverage**: Maintain testable code structure
11. **Cognitive Workflow**: Follow ANALYZE→PLAN→EXECUTE→VERIFY cycle
12. **Preferred Tools**: Use built-in tools over manual workflows

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   # Then fill in your Supabase credentials
   ```
4. Start the development server:
   ```bash
   npm start
   ```

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Start on Android emulator/device
- `npm run ios` - Start on iOS simulator/device
- `npm run web` - Start in web browser
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests

## Project Structure

See `PROJECT_STRUCTURE.md` for detailed explanation of how each skill is applied to the project organization.

## Guidelines for Contributors

When contributing to this project, please follow these guidelines:

1. **Ask Before Assuming**: If unsure about requirements, ask for clarification
2. **Simplest Solution**: Implement the minimum necessary to solve the problem
3. **No Unauthorized Changes**: Don't modify code unrelated to your task
4. **No New Dependencies Without Approval**: Discuss new dependencies before adding
5. **Follow Existing Patterns**: Use established patterns for consistency
6. **Write Clear Commit Messages**: Explain what and why, not just how
7. **Keep Commits Focused**: Each commit should address a single concern
8. **Run Checks Before Committing**: Ensure linting, type-checking, and tests pass

## License

This project is private and proprietary.

## Acknowledgments

- Built with Expo and React Native
- Powered by Supabase for backend services
- Inspired by Karpathy Skills principles for software development