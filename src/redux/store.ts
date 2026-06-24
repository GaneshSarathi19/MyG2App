import {configureStore, combineReducers} from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer, {AuthState} from './slices/authSlice';
import settingsReducer, {SettingsState} from './slices/settingsSlice';

/* ── Persist Transform for Remember Me ───────────────────────────────── */

const authTransform = createTransform<
  AuthState,
  AuthState,
  any,
  any
>(
  (inboundState: AuthState) => {
    if (!inboundState.rememberMe) {
      return {
        ...inboundState,
        authToken: null,
        refreshToken: null,
        user: null,
        isLoggedIn: false,
        tokenExpiry: null,
      };
    }
    return inboundState;
  },
  (outboundState: AuthState) => outboundState,
  {whitelist: ['auth']},
);

/* ── Persist Config ────────────────────────────────────────────────────── */

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'settings'],
  transforms: [authTransform],
};

/* ── Root Reducer ────────────────────────────────────────────────────── */

export interface RootState {
  auth: AuthState;
  settings: SettingsState;
}

const rootReducer = combineReducers({
  auth: authReducer,
  settings: settingsReducer,
});

const persistedReducer: any = persistReducer(persistConfig, rootReducer as any);

/* ── Store ─────────────────────────────────────────────── */

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

/* ── Persistor ──────────────────────────────────────────── */

export const persistor = persistStore(store);

/* ── Type Definitions ───────────────────────────────────── */

export type AppDispatch = typeof store.dispatch;
