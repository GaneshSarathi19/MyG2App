import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import {COLORS} from '../../theme/colors';
import {useAuth} from '../../context/AuthContext';
const LoginScreen = () => {
  const {login} = useAuth();

  const validUsername = 'admin';
  const validPassword = '1234';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [isUsernameFocused, setIsUsernameFocused] =
    useState(false);

  const [isPasswordFocused, setIsPasswordFocused] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const passwordInputRef = useRef<TextInput>(null);

  const handleUsernameChange = (text: string) => {
    const filteredText = text.replace(
      /[^a-zA-Z0-9]/g,
      '',
    );

    setUsername(filteredText);
  };

  const isFormValid =
    username === validUsername &&
    password === validPassword;

  const handleLogin = () => {
    if (!isFormValid) {
      Alert.alert(
        'Login Failed',
        'Invalid Username or Password',
      );
      return;
    }

    login();
  };

  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }>
        <ScrollView
          contentContainerStyle={
            styles.scrollContainer
          }
          keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
           <Image
  source={require('../../assets/images/g2_logo.png')}
  style={styles.logo}
  resizeMode="contain"
/> 
<Text style={styles.text}>
  Welcome to{' '}
  <Text style={styles.myText}>
    My
  </Text>
  <Text style={styles.g2Text}>
    G2
  </Text>
</Text>
<Text style={styles.title}>
  Employee Portal
</Text>

<View style={styles.loginCard}>

  <TextInput
    style={[
      styles.input,
      isUsernameFocused &&
        styles.activeInput,
    ]}
    placeholder="Username"
    placeholderTextColor={
      COLORS.textSecondary
    }
    value={username}
    onChangeText={handleUsernameChange}
    returnKeyType="next"
    onSubmitEditing={() =>
      passwordInputRef.current?.focus()
    }
    onFocus={() =>
      setIsUsernameFocused(true)
    }
    onBlur={() =>
      setIsUsernameFocused(false)
    }
  />

  {username.length > 0 &&
    username !== validUsername && (
      <Text style={styles.errorText}>
        Invalid Username
      </Text>
    )}

  <View
    style={[
      styles.passwordContainer,
      isPasswordFocused &&
        styles.activeInput,
    ]}>
    <TextInput
      ref={passwordInputRef}
      style={styles.passwordInput}
      placeholder="Password"
      placeholderTextColor={
        COLORS.textSecondary
      }
      value={password}
      onChangeText={setPassword}
      secureTextEntry={!showPassword}
      returnKeyType="done"
      onSubmitEditing={handleLogin}
      onFocus={() =>
        setIsPasswordFocused(true)
      }
      onBlur={() =>
        setIsPasswordFocused(false)
      }
    />

    <TouchableOpacity
      onPress={() =>
        setShowPassword(!showPassword)
      }>
      <Text style={styles.toggleText}>
        {showPassword ? 'Hide' : 'Show'}
      </Text>
    </TouchableOpacity>
  </View>

  {password.length > 0 &&
    password !== validPassword && (
      <Text style={styles.errorText}>
        Invalid Password
      </Text>
    )}

  <TouchableOpacity
    style={[
      styles.loginButton,
      !isFormValid &&
        styles.disabledButton,
    ]}
    disabled={!isFormValid}
    onPress={handleLogin}>
    <Text style={styles.loginButtonText}>
      Login
    </Text>
  </TouchableOpacity>

</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
logo: {
  width: 220,
  height: 90,
  alignSelf: 'center',
  marginBottom: 20,
},
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
    backgroundColor: COLORS.primary,
  },
myText: {
  color: COLORS.secondary,
  fontWeight: '700',
},

g2Text: {
  color: '#c4122c',
  fontWeight: '700',
  fontSize: 30,
},
  loginCard: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 25,
    elevation: 5,

    shadowColor: '#f5eeee',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  text: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    color: '#E2E8F0',
    fontWeight: '600',
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
    color: '#FFFFFF',
  },

  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.card,
  },

  activeInput: {
    borderColor: COLORS.secondary,
    borderWidth: 2,
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: COLORS.card,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: COLORS.textPrimary,
  },

  toggleText: {
    color: COLORS.secondary,
    fontWeight: '600',
  },

  errorText: {
    color: COLORS.danger,
    marginBottom: 10,
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '500',
  },

  loginButton: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    elevation: 3,
  },

  disabledButton: {
    backgroundColor: COLORS.disabled,
    elevation: 0,
  },

  loginButtonText: {
    color: COLORS.card,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});
export default LoginScreen;