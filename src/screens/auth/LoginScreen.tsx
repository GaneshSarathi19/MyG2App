import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import ErrorView from '../../components/ErrorView';
import LogoContainer from '../../components/LogoContainer';

const EMAIL_REGEX = /^[\w-.]+@[\w-]+\.[A-Za-z]{2,}$/;

/* ─── Dashboard Palette ──────────────────────────────────────────── */
const COLORS = {
  red: '#C5122C',
  navy: '#003C64',
  orange: '#F86F18',
  gray: '#706B6B',
  subtle: '#F5F6F8',
  white: '#FFFFFF',
  dark: '#1A1A2E',
  inputBorder: '#D9DEE7',
};

const LoginScreen = () => {
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [touched, setTouched] = useState({
    username: false,
    password: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: {
      username?: string;
      password?: string;
    } = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (
      username.includes('@') &&
      !EMAIL_REGEX.test(username)
    ) {
      newErrors.username = 'Enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleLogin = () => {
    setLoading(true);
    setLoginError(null);

    const validation = validate();

    setTouched({
      username: true,
      password: true,
    });

    setErrors(validation);

    if (
      validation.username ||
      validation.password
    ) {
      setLoading(false);
      return;
    }

    if (
      username.trim() === 'admin' &&
      password === '1234'
    ) {
      setLoading(false);
      setErrors({});
      setTouched({
        username: false,
        password: false,
      });
      login();
      return;
    }

    setLoading(false);
    setLoginError('Invalid Username or Password');
  };

  const clearLoginError = () => {
    setLoginError(null);
  };

  return (
    <TouchableWithoutFeedback
      accessible={false}
      onPress={Keyboard.dismiss}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.scrollContainer
          }
          keyboardShouldPersistTaps="handled"
        >
          {/* Top decorative banner */}
          <View style={styles.banner}>
            <View style={styles.bannerAccent} />
          </View>

          <View style={styles.card}>
            <LogoContainer
              variant="full"
              // TODO: swap placeholder with real logo PNG
              source={require('../../resources/g2logo-small.png')}
            />

            {loginError && (
              <View style={styles.errorWrap}>
                <ErrorView message={loginError} onRetry={clearLoginError} />
              </View>
            )}

            <TextInput
              style={[
                styles.input,
                touched.username && errors.username && styles.inputError,
              ]}
              placeholder="Username"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onFocus={() => {
                setTouched((prev) => ({
                  ...prev,
                  username: true,
                }));
              }}
            />

            {touched.username &&
            errors.username ? (
              <Text style={styles.errorText}>
                {errors.username}
              </Text>
            ) : null}

            <View
              style={[
                styles.passwordContainer,
                touched.password && errors.password && styles.inputError,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={
                  handleLogin
                }
                onFocus={() => {
                  setTouched((prev) => ({
                    ...prev,
                    password: true,
                  }));
                }}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                <Text
                  style={
                    styles.toggleText
                  }
                >
                  {showPassword
                    ? 'Hide'
                    : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            {touched.password &&
            errors.password ? (
              <Text style={styles.errorText}>
                {errors.password}
              </Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading &&
                  styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.loginButtonText}>
                  Signing in…
                </Text>
              ) : (
                <Text
                  style={
                    styles.loginButtonText
                  }
                >
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.demoText}>
              Demo Credentials:
              {'\n'}
              Username: admin
              {'\n'}
              Password: 1234
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.subtle,
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },

  /* ── Top banner ────────────────────────────────────────────────── */
  banner: {
    height: 6,
    backgroundColor: COLORS.navy,
    marginHorizontal: 20,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  bannerAccent: {
    width: '33%',
    height: '100%',
    backgroundColor: COLORS.orange,
  },

  /* ── Card ───────────────────────────────────────────────────────── */
  card: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    backgroundColor: COLORS.white,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,

    elevation: 5,
  },

  brandWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandIconText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    color: COLORS.dark,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: COLORS.gray,
    marginBottom: 0,
  },

  /* ── Inputs ──────────────────────────────────────────────────────── */
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
    fontSize: 15,
    color: COLORS.dark,
    marginBottom: 6,
  },
  inputError: {
    borderColor: COLORS.red,
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    marginTop: 8,
  },

  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.dark,
  },

  toggleText: {
    color: COLORS.navy,
    fontWeight: '700',
    fontSize: 13,
  },

  errorText: {
    color: COLORS.red,
    marginTop: 2,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '500',
  },

  errorWrap: {
    marginBottom: 16,
  },

  /* ── Button ───────────────────────────────────────────────────────── */
  loginButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },

  /* ── Demo ────────────────────────────────────────────────────────── */
  demoText: {
    marginTop: 20,
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 12,
    lineHeight: 18,
  },
});

export default LoginScreen;
