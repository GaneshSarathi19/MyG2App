# CLAUDE.md

Professional coding and development guidelines for this React Native CLI project with TypeScript.

## Standards

- All code, development, and testing must follow industry best practices.
- Keep code DRY, well-commented, and type-safe.
- Use clear, descriptive naming. Avoid magic strings/numbers.
- Prefer composition over inheritance. Keep functions small and focused.
- No emojis in source code, logs, or documentation.

## Commands

| Task | Command |
|------|---------|
| Start Metro bundler | `npm start` |
| Run Android | `npm run android` |
| Run iOS | `npm run ios` |
| Run tests | `npm test` |
| Run a single test file | `npx jest <path/to/file.test.tsx>` |
| Run tests matching a pattern | `npx jest --testNamePattern="<pattern>"` |
| Lint | `npm run lint` |

## Superpowers

Invoke the following skills as appropriate:

| Situation | Skill |
|-----------|-------|
| Before any creative/architecture work | `superpowers:brainstorming` |
| Planning a multi-step task | `superpowers:writing-plans` |
| Executing an implementation plan | `superpowers:executing-plans` |
| Debugging a bug or test failure | `superpowers:systematic-debugging` |
| Before claiming work is complete | `superpowers:verification-before-completion` |
| Submitting/reviewing PRs | `superpowers:requesting-code-review` |

## Design

When designing UI/UX or frontend components:

- `frontend-design`
- `vercel-react-best-practices`
- `react-native-best-practices`

## Architecture

### Navigation

- Uses `@react-navigation/native` (v7) with `@react-navigation/native-stack`.
- `RootNavigator` (`src/navigation/RootNavigator.tsx`) switches between `AuthStack` and `AppStack` based on `isLoggedIn` from `AuthContext`.
- `AuthStack` (`src/navigation/AuthStack.tsx`) contains `LoginScreen` only.
- `AppStack` (`src/navigation/AppStack.tsx`) contains authenticated screens (`DashboardScreen`). Each screen has a header hamburger button that calls `useDrawer().toggle()`.
- `SidePanel` (`src/components/SidePanel.tsx`) is an absolute `Animated` overlay rendered above the current stack by `RootNavigator`.

### Auth

- `AuthContext` (`src/context/AuthContext.tsx`) holds `isLoggedIn`, `authToken`, `user` profile, `login()`, and `logout()`. Calls the backend API via `AuthService`.
- `AuthService` (`src/services/AuthService.ts`) contains `validateLogin()` for live API calls and `validateLoginMock()` for offline testing.
- `API Config` (`src/api/config.ts`) holds `API_BASE_URL`, `ENDPOINTS`, and `DEVICE_ID`.
- `Auth Types` (`src/api/interfaces/AuthTypes.ts`) defines the backend login request/response contract.
- `Password Encryption` (`src/utils/encryptPassword.ts`) encrypts passwords with AES-256-CBC via `crypto-js`.
- `App.tsx` wraps the app in `<AuthProvider>`.
- Requests/responses are logged in `AuthService` for debugging purposes.

### Drawer / Side Panel

- Does not use `@react-navigation/drawer`. Uses a custom `DrawerContext` + `SidePanel` component.
- `DrawerContext` (``from `useDrawer()`.
- `SidePanel` (`src/components/SidePanel.tsx`) is an absolute `Animated` overlay and panel with a backdrop. Renders above the current stack.

### Styling

- Inline `StyleSheet.create()` objects in screen/component files. No CSS-in-JS or styled-components.
- Shared colors in `src/theme/colors.ts`.
- Login and dashboard define local `COLORS` objects (red `#C5122C`, navy `#003C64`, orange `#F86F18`).

### Components

- `ErrorView` (`src/components/ErrorView.tsx`) -- reusable error display with an optional retry button.
- `LogoContainer` (`src/components/LogoContainer.tsx`) -- brand logo wrapper for the login screen.
- `SidePanel` (`src/components/SidePanel.tsx`) -- custom animated drawer.

### State

- React `useState` and `useContext`. No external state library.
- `useDebouncedValue` utility in `src/utils/`.

### Testing

- Jest with `@react-native/jest-preset`.
- Test files colocated or in `__tests__/`.
- Write unit tests for services, utilities, and complex hooks. Include integration tests for auth flows.
- Use `jest.mock()` for network calls. Mock `fetch` or the service layer, never hit the real API in tests.
- Maintain > 80% coverage for services and utilities.

## Backend Integration

### API Configuration

Connects to the Synergy Dashboard API via `src/api/config.ts`:

- `API_BASE_URL` -- base URL of the backend API.
- `ENDPOINTS.validateLogin` -- login endpoint path.
- `DEVICE_ID` -- fixed device identifier.

Update `API_BASE_URL` when switching environments (dev, staging, production).

### Login Flow

1. User enters credentials on `LoginScreen`.
2. `LoginScreen` validates (required fields, email format if `@` present).
3. Calls `login(username, password)` from `AuthContext`.
4. `AuthContext` calls `validateLogin()` from `AuthService`.
5. `AuthService` encrypts the password and sends a `POST` request.
6. On success, `AuthContext` stores the JWT `Token` and user profile, setting `isLoggedIn = true`.
7. `RootNavigator` switches from `AuthStack` to `AppStack`.

### Handling Backend Changes

1. Update `src/api/interfaces/AuthTypes.ts` to match the new contract.
2. Update `src/services/AuthService.ts` for the new payload/response.
3. Update `src/api/config.ts` for endpoint or base URL changes.
4. Update `src/context/AuthContext.tsx` for success/error logic changes.
5. Use `superpowers:systematic-debugging` if the flow breaks after a backend change.

## Progress

| Feature | Status |
|---------|--------|
| Backend API login | Done |
| Password encryption | Done |
| Login screen UI/UX | Done |
| Dashboard screen | Done |
| Side panel / drawer | Done |
| Navigation (Auth/App) | Done |
| Error handling | Done |

### Next Steps

- Token persistence (AsyncStorage or SecureStore).
- Add screens to `AppStack` (ListView, Profile).
- Populate `SidePanel` navigation links.
- Add refresh token / session expiry handling.
- API interceptor for attaching `authToken`.
- Loading skeletons / pull-to-refresh on dashboard.
