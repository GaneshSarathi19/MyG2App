import React, {useState} from 'react';
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
import { Colors, Fonts } from '../../theme';
import {useAuth} from '../../context/AuthContext';
import ErrorView from '../../components/ErrorView';
import LogoContainer from '../../components/LogoContainer';
import AppScreen from '../../components/layout/AppScreen';

const EMAIL_REGEX = /^[\w-.]+@[\w-]+\.[A-Za-z]{2,}$/;

/* ─── Colors ───────────────────────────────────────────────────────── */

const LoginScreen = () => {
  const {login, isLoading, error: authError, clearAuthError} = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [touched, setTouched] = useState({
    username: false,
    password: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const validate = () => {
    const newErrors: {
      username?: string;
      password?: string;
    } = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.includes('@') && !EMAIL_REGEX.test(username)) {
      newErrors.username = 'Enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  /**
   * Triggers the backend login validation.
   */
  const handleLogin = async () => {
    const validation = validate();

    setTouched({
      username: true,
      password: true,
    });

    setErrors(validation);

    if (validation.username || validation.password) {
      return;
    }

    try {
      const result = await login(username, password, rememberMe);

      if (result.success) {
        setErrors({});
        setTouched({
          username: false,
          password: false,
        });
      }
    } catch {
      // Error is handled in the Redux slice; nothing to do here.
    }
  };

  const clearLoginError = () => {
    clearAuthError();
  };

  return (
    <AppScreen>
    <TouchableWithoutFeedback
      accessible={false}
      onPress={Keyboard.dismiss}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top decorative banner */}
          <View style={styles.banner}>
            <View style={styles.bannerAccent} />
          </View>

          <View style={styles.card}>
            <LogoContainer
              variant="full"
              source={require('../../resources/g2logo-small.png')}
            />

            {authError && (
              <View style={styles.errorWrap}>
                <ErrorView message={authError} onRetry={clearLoginError} />
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
                setTouched(prev => ({
                  ...prev,
                  username: true,
                }));
              }}
            />

            {touched.username && errors.username ? (
              <Text style={styles.errorText}>{errors.username}</Text>
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
                onSubmitEditing={handleLogin}
                onFocus={() => {
                  setTouched(prev => ({
                    ...prev,
                    password: true,
                  }));
                }}
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.toggleText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            {touched.password && errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}

            {/* Remember Me */}
            <TouchableOpacity
              style={styles.rememberMeRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  rememberMe && styles.checkboxChecked,
                ]}
              >
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberMeText}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.loginButtonText}>Signing in...</Text>
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.demoText}>
              Demo Credentials:{"\n"}Username: admin{"\n"}Password: 1234
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  </AppScreen>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.subtle,
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },

  banner: {
    height: 6,
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  bannerAccent: {
    width: '33%',
    height: '100%',
    backgroundColor: Colors.accent,
  },

  card: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.background,
    fontSize: 15,
    color: Colors.dark,
    marginBottom: 6,
  },
  inputError: {
    borderColor: Colors.danger,
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
    marginTop: 8,
  },

  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark,
  },

  toggleText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },

  errorText: {
    color: Colors.danger,
    marginTop: 2,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '500',
  },

  errorWrap: {
    marginBottom: 16,
  },

  // Remember Me
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  rememberMeText: {
    fontSize: 14,
    color: Colors.dark,
  },

  loginButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: Colors.background,
    fontSize: 15,
    fontWeight: '700',
  },

  demoText: {
    marginTop: 20,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});

export default LoginScreen;
