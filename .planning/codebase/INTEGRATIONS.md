# External Integrations

## APIs
- **Admin API**: Accessed via `apiFetch` in `src/services/api.ts`. Base URL defined in `VITE_ADMIN_API` environment variable.
- **Authentication**: Custom authentication flow with access/refresh tokens handled in `src/services/auth.service.ts`.

## Services
- **Product Management**: `product.service.ts` for handling product CRUD and image uploads.
- **Category Management**: `category.service.ts`.
- **Variation Management**: `variation.service.ts`.
- **Authentication**: `auth.service.ts` managing login, token refresh, and session persistence.

## Environment Variables
- `VITE_ADMIN_API`: Base URL for the backend API.
