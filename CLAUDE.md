# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React Native CLI app with TypeScript, bootstrapped via `@react-native-community/cli`. Thin client app with local auth state and a custom slide-out panel navigation.

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

## Design

When asked to design UI/UX, interfaces, or frontend components, invoke the following skills:

- `frontend-design`
- `vercel-react-best-practices`
- `react-native-best-practices`

## Architecture

### Navigation

- Uses `@react-navigation/native` (v7) with `@react-navigation/native-stack`.
- **RootNavigator** (`src/navigation/RootNavigator.tsx`) switches between `AuthStack` and `AppStack` based on `isLoggedIn` from `AuthContext`.
- **AuthStack** only contains `LoginScreen`.
- **AppStack** contains authenticated screens (e.g., `DashboardScreen`, `ListViewScreen`). Each screen has a header hamburger button that calls `useDrawer().toggle()`.

### Auth

- **AuthContext** (`src/context/AuthContext.tsx`) holds `isLoggedIn` (boolean), `login()`, and `logout()`. The login is hardcoded: `username === 'admin' && password === '1234'`.
- `App.tsx` wraps the app in `<AuthProvider>`. No token storage or API integration exists yet.

### Drawer / Side Panel

- The app does **not** use `@react-navigation/drawer`. Instead, it uses a **custom** `DrawerContext` + `SidePanel` component.
- **DrawerContext** (`src/context/DrawerContext.tsx`) exposes `open`, `toggle`, `openDrawer`, `closeDrawer`.
- **SidePanel** (`src/components/SidePanel.tsx`) is an absolute `Animated` overlay and panel with a backdrop. It renders above the current stack. Navigation items in the panel should navigate via the standard React Navigation APIs.

### Styling & Theme

- Styles are inline `StyleSheet.create()` objects in screen/component files. No CSS-in-JS or styled-components.
- Shared colors are defined in `src/theme/colors.ts`.

### State & Hooks

- All state is managed with React `useState` and `useContext`. No external state library (e.g., Zustand, Redux) is used.
- `useDebouncedValue` is a small utility hook under `src/utils/`.

### Testing

- Uses Jest with `@react-native/jest-preset` configured in `jest.config.js`.
- Test files are colocated or placed in `__tests__/`.
