# Architecture

## Design Patterns
- **Feature-based Component Organization**: Components are grouped by domain (auth, products, variations) or by utility (ui, common).
- **Service Layer**: API communication is abstracted into service files in `src/services`.
- **Custom Hooks**: Business logic and data fetching logic are often extracted into custom hooks in `src/hooks`.
- **Validation-Driven Forms**: Uses Zod for schema validation and React Hook Form for form state management.
- **Atomic-ish UI**: Base UI components (atoms/molecules) are located in `src/components/ui`, based on Shadcn UI.

## Data Flow
- **Server State**: Managed by TanStack Query (React Query) for caching and synchronization.
- **Global State**: Minimal use of global state; largely relies on URL state (via React Router) and server state.
- **Authentication State**: Managed in `auth.service.ts` with token storage in memory/session.

## Routing
- **Declarative Routing**: Defined in `src/App.tsx` using `react-router-dom`.
- **Protected Routes**: Handled via authentication checks (likely in `App.tsx` or specialized layout components).
