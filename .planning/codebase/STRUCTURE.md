# Project Structure

```text
src/
├── components/          # React components
│   ├── admin/           # Admin-specific layout/components
│   ├── auth/            # Authentication components (Login, etc.)
│   ├── common/          # Shared components across features
│   ├── products/        # Product management components
│   ├── ui/              # Base UI components (Shadcn)
│   └── variations/      # Product variation components
├── data/                # Static data and constants
├── hooks/               # Custom React hooks
├── lib/                 # Third-party library configurations (e.g., utils.ts)
├── pages/               # Main route components/pages
├── services/            # API services and business logic
├── test/                # Test configuration and helpers
├── types/               # TypeScript interfaces and types
├── utils/               # Helper functions
└── validations/         # Zod schemas for form validation
```

## Key Files
- `src/App.tsx`: Main application component and routing definition.
- `src/main.tsx`: Entry point of the application.
- `src/services/api.ts`: Base API configuration.
- `tailwind.config.ts`: Tailwind CSS configuration.
- `vite.config.ts`: Vite build configuration.
