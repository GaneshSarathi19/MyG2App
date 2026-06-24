import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface SettingsState {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  biometricEnabled: boolean;
  darkMode: boolean;
}

const initialState: SettingsState = {
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  biometricEnabled: false,
  darkMode: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.notificationsEnabled = action.payload;
    },
    setSoundEnabled: (state, action: PayloadAction<boolean>) => {
      state.soundEnabled = action.payload;
    },
    setVibrationEnabled: (state, action: PayloadAction<boolean>) => {
      state.vibrationEnabled = action.payload;
    },
    setBiometricEnabled: (state, action: PayloadAction<boolean>) => {
      state.biometricEnabled = action.payload;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    resetSettings: () => initialState,
  },
});

export const {
  setNotificationsEnabled,
  setSoundEnabled,
  setVibrationEnabled,
  setBiometricEnabled,
  setDarkMode,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
