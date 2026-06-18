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

### Design & Layout Guidelines

All screens and components follow these design rules:

1. **Use `AppScreen` wrapper** -- Every screen must be wrapped in `<AppScreen>` from `src/components/layout/AppScreen.tsx`. It provides a `SafeAreaView` with edges `top`, `left`, `right`.
2. **Import from theme, never hardcode colors/fonts** -- Use `import { Colors, Fonts } from '../../theme';`. Never hardcode color hex values or font sizes. Access via `Colors.primary`, `Fonts.sizes.md`, `Fonts.bold`, etc.
3. **Prefer reusable components** -- If a common component exists in `src/components/common/`, use it instead of inline equivalents (e.g., `AppHeader`, `SectionCard`, `InfoRow`, `AvatarBadge`).
4. **SafeAreaView for edge protection** -- `AppScreen` already wraps the screen. Do not nest additional `SafeAreaView`s unless handling edge-specific insets inside a component. Insets are handled at the top level only.
5. **Consistent card shadow / elevation** -- Cards and sections should use the standard shadow style (elevation: 2, shadowOpacity: 0.06, shadowRadius: 3). `SectionCard` component handles this automatically.
6. **Typography hierarchy**:
   - Screen title: `Fonts.sizes.lg`, `Fonts.bold`
   - Card title: `Fonts.sizes.md`, `Fonts.bold`
   - Body text: `Fonts.sizes.sm`, `Fonts.regular`
   - Small / subtle text: `Fonts.sizes.xs`, `Fonts.semiBold`
7. **Avatar / initials** -- Use `AvatarBadge` for user initials. It auto-sizes and uses the theme `primary` color.
8. **Info rows** -- Use `InfoRow` for label-value pairs. It auto-handles null/undefined with a dash.
9. **Card sections** -- Use `SectionCard` to group related fields with a consistent container style.
10. **Header back navigation** -- Use `AppHeader` instead of manually creating a back button with `navigation.goBack()`. It provides consistent styling and back arrow behavior.

### Components

- `AppScreen` (`src/components/layout/AppScreen.tsx`) -- wrapper providing `SafeAreaView` with top/left/right edges. Every screen uses this.
- `AppHeader` (`src/components/common/AppHeader.tsx`) -- top bar with back button and screen title. Accepts `title` and `showBack` props.
- `SectionCard` (`src/components/common/SectionCard.tsx`) -- reusable card grouping related info rows. Styled with standard elevation and shadow.
- `InfoRow` (`src/components/common/InfoRow.tsx`) -- label-value row for profile/settings detail screens. Auto-renders `—` for null/undefined.
- `AvatarBadge` (`src/components/common/AvatarBadge.tsx`) -- circular initials badge. Accepts `initials` string and optional `size`.
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
| Profile screen | Done |
| Reusable UI components | Done |

### Next Steps

- Populate `SidePanel` navigation links.
- Loading skeletons / pull-to-refresh on dashboard.
- ListView screen for data-heavy screens.
- Add refresh token / session expiry handling.
- Biometric authentication support.
