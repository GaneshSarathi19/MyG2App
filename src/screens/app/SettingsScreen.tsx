import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import {useAppSelector, useAppDispatch} from '../../redux/hooks';
import {
  setNotificationsEnabled,
  setSoundEnabled,
  setVibrationEnabled,
  setBiometricEnabled,
  setDarkMode,
} from '../../redux/slices/settingsSlice';
import {Colors, Fonts} from '../../theme';
import AppScreen from '../../components/layout/AppScreen';
import AppHeader from '../../components/common/AppHeader';

/* ─── Interfaces ──────────────────────────────────────────────────── */

interface SettingRowProps {
  label: string;
  subLabel?: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

/* ─── Reusable Components ───────────────────────────────────────────── */

const SettingSection: React.FC<SettingSectionProps> = ({title, children}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

const SettingRow: React.FC<SettingRowProps> = ({label, subLabel, value, onToggle}) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      <Text style={styles.rowLabel}>{label}</Text>
      {subLabel && <Text style={styles.rowSub}>{subLabel}</Text>}
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{false: Colors.border, true: Colors.secondary}}
      thumbColor={Colors.white}
      ios_backgroundColor={Colors.border}
    />
  </View>
);

/* ─── Screen ──────────────────────────────────────────────────────── */

const SettingsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(state => state.settings);
  const {
    notificationsEnabled = true,
    soundEnabled = true,
    vibrationEnabled = true,
    biometricEnabled = false,
    darkMode = false,
  } = settings ?? {};

  const handleToggleBiometric = (value: boolean) => {
    if (value) {
      // Placeholder: biometric setup would be triggered here
      Alert.alert(
        'Biometric Authentication',
        'Biometric authentication will be enabled on next app launch.',
        [{text: 'OK', onPress: () => dispatch(setBiometricEnabled(value))}],
      );
    } else {
      dispatch(setBiometricEnabled(value));
    }
  };

  const handleToggleDarkMode = (value: boolean) => {
    dispatch(setDarkMode(value));
    // Dark mode implementation is a placeholder for future theming
    if (value) {
      Alert.alert(
        'Dark Mode',
        'Dark mode theme is currently under development.',
        [{text: 'OK'}],
      );
    }
  };

  return (
    <AppScreen>
      <AppHeader title="Settings" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Notifications ─────────────────────────────────扶手────── */}
        <SettingSection title="Notifications">
          <SettingRow
            label="Push Notifications"
            subLabel="Receive alerts for approvals, meetings, and announcements"
            value={notificationsEnabled}
            onToggle={value => dispatch(setNotificationsEnabled(value))}
          />
          <View style={styles.divider} />
          <SettingRow
            label="Sound"
            subLabel="Play sound for notification alerts"
            value={soundEnabled}
            onToggle={value => dispatch(setSoundEnabled(value))}
          />
          <View style={styles.divider} />
          <SettingRow
            label="Vibration"
            subLabel="Vibrate on incoming notifications"
            value={vibrationEnabled}
            onToggle={value => dispatch(setVibrationEnabled(value))}
          />
        </SettingSection>

        {/* ── Security ──────────────────────────────────────── */}
        <SettingSection title="Security">
          <SettingRow
            label="Biometric Authentication"
            subLabel="Use fingerprint or face recognition to unlock the app"
            value={biometricEnabled}
            onToggle={handleToggleBiometric}
          />
        </SettingSection>

        {/* ── Appearance ─────────────────────────────────────── */}
        <SettingSection title="Appearance">
          <SettingRow
            label="Dark Mode"
            subLabel="Switch to a dark colour theme (coming soon)"
            value={darkMode}
            onToggle={handleToggleDarkMode}
          />
        </SettingSection>

        {/* ── About ──────────────────────────────────────────── */}
        <SettingSection title="About">
          <View style={styles.aboutRow}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowLabel}>App Version</Text>
              <Text style={styles.rowSub}>1.0.0 (Build 2026.06.22)</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowLabel}>Environment</Text>
              <Text style={styles.rowSub}>UAT</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowLabel}>Support</Text>
              <Text style={styles.rowSub}>IT Helpdesk - helpdesk@company.com</Text>
            </View>
          </View>
        </SettingSection>
      </ScrollView>
    </AppScreen>
  );
};

/* ─── Styles ──────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: {
    flex: 1,
    paddingRight: 16,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  rowSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 16,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});

export default SettingsScreen;
