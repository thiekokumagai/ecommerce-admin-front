# Coding Conventions

## Language Standards
- **TypeScript**: Strict mode (judging by tsconfig) is likely enabled.
- **ESNext**: Using modern JavaScript features (ES2020+).

## React Patterns
- **Functional Components**: All components are written as functional components with hooks.
- **File Naming**: PascalCase for components (`ProductDetailsForm.tsx`), camelCase for hooks (`useProduct.ts`) and utils.
- **Component Structure**: Imports -> Types/Interfaces -> Component Logic -> Sub-components (if internal).

## Styling
- **Utility-first CSS**: Tailwind CSS is the primary styling method.
- **Conditional Classes**: `clsx` and `tailwind-merge` are used for dynamic styling.

## State Management
- **React Query**: Used for almost all data-fetching operations.
- **React Hook Form**: Standardized for form management.

## Linting & Formatting
- **ESLint**: Recommended rules for JS, TS, and React Hooks.
- **Unused Variables**: Currently set to `off` in ESLint, which might be a concern.
