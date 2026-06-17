import {configureStore, combineReducers, Reducer} from '@reduxjs/toolkit';
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

/* ── Persist Transform for Remember Me ───────────────────────────────── */

/**
 * Conditionally persists sensitive auth data based on the rememberMe flag.
 * When rememberMe is false, auth tokens and user data are NOT written to
 * persistent storage, ensuring the user must log in again after app restart.
 */
const authTransform = createTransform<
  AuthState,
  AuthState,
  // no additional keys needed beyond `auth`
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
        error: null,
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
  whitelist: ['auth'],
  transforms: [authTransform],
};

/* ── Root Reducer ──────────────────────────────────────────────────────── */

const rootReducer = combineReducers({
  auth: authReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer) as Reducer<{
  auth: AuthState;
}>;


/* ── Store ─────────────────────────────────────────────────────────────── */

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

/* ── Persistor ─────────────────────────────────────────────────────────── */

export const persistor = persistStore(store);

/* ── Type Definitions ──────────────────────────────────────────────────── */

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
