# Codebase Concerns

## Technical Debt
- **Multiple Lock Files**: Found `bun.lock`, `package-lock.json`, and `pnpm-lock.yaml`. This can lead to dependency inconsistencies. A single package manager should be chosen.
- **Low Test Coverage**: Minimal testing presence in the codebase. Critical business flows (orders, payments, product creation) should be tested.
- **ESLint Relaxed Rules**: `@typescript-eslint/no-unused-vars` is set to `off`, which can lead to cluttered code and potential bugs.

## Architectural Risks
- **Direct Fetch Usage**: While `apiFetch` provides a wrapper, many components or services might be tightly coupled to this specific implementation.
- **Large Page Components**: `ProductDetailsPage.tsx` is quite large (~30k bytes), suggesting it might be doing too much and could benefit from further decomposition.

## Security
- **Authentication**: Token handling is custom. Ensure refresh token rotation and secure storage patterns are robust.

## UX/UI
- **Responsiveness**: The admin panel has many complex tables and forms. Ensuring mobile responsiveness for all these pages is a significant task.
