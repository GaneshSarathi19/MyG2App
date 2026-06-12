import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';

const EMAIL_REGEX = /^[\w-.]+@[\w-]+\.[A-Za-z]{2,}$/;

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
      newErrors.username =
        'Enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password =
        'Password is required';
    }

    return newErrors;
  };

  const handleLogin = () => {
    setLoading(true);

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

    Alert.alert(
      'Login Failed',
      'Invalid Username or Password'
    );
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
          <View style={styles.card}>
            <Text style={styles.title}>
              Employee Portal
            </Text>

            <Text style={styles.subtitle}>
              Sign in to continue
            </Text>

            <TextInput
              style={styles.input}
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

            {touched.username &&
            errors.username ? (
              <Text style={styles.errorText}>
                {errors.username}
              </Text>
            ) : null}

            <View style={styles.passwordContainer}>
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
                  setTouched(prev => ({
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
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.loginButtonText
                  }
                >
                  Login
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
    backgroundColor: '#F3F6FA',
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },

  card: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    elevation: 4,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 32,
  },

  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#D9DEE7',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    borderColor: '#D9DEE7',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },

  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },

  toggleText: {
    color: '#2563EB',
    fontWeight: '600',
  },

  errorText: {
    color: '#DC2626',
    marginTop: 4,
    marginBottom: 12,
    fontSize: 13,
  },

  loginButton: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  demoText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 20,
  },
});

export default LoginScreen;