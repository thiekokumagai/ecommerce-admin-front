# Testing Strategy

## Frameworks
- **Unit/Integration Testing**: Vitest.
- **End-to-End Testing**: Playwright.
- **Component Testing**: React Testing Library.

## Configuration
- `vitest.config.ts`: Configured for JSDOM and React testing.
- `playwright.config.ts`: Standard E2E configuration.

## Current State
- **Coverage**: Likely low, as only `example.test.ts` was found in `src/test`.
- **Mocks**: Setup for testing found in `src/test/setup.ts`.

## Execution
- `npm test`: Runs Vitest in one-shot mode.
- `npm run test:watch`: Runs Vitest in watch mode.
