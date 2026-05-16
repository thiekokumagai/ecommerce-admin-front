# Technology Stack

## Core
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.19
- **Language**: TypeScript 5.8.3
- **Package Manager**: npm (judging by package-lock.json), though bun and pnpm locks are present.

## UI & Styling
- **Styling**: Tailwind CSS 3.4.17
- **Components**: Radix UI (various primitives)
- **Design System**: Shadcn UI patterns
- **Icons**: Lucide React
- **Animations**: tailwindcss-animate, framer-motion (not explicitly in dependencies but often used with shadcn, wait, let me re-check dependencies)
- **Forms**: React Hook Form 7.72.1 + Zod 3.25.76 + @hookform/resolvers

## State Management & Data Fetching
- **Server State**: @tanstack/react-query 5.83.0
- **Routing**: React Router Dom 6.30.1

## Utilities
- **Date Handling**: date-fns 3.6.0
- **Class Merging**: clsx, tailwind-merge
- **UI Components**: embla-carousel-react, vaul, sonner

## Development & Tooling
- **Linting**: ESLint 9.32.0 (Flat config)
- **Type Checking**: TypeScript
- **Testing**: Vitest 3.2.4, Playwright 1.57.0, Testing Library
