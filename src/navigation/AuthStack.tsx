import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import OrganisationScreen from '../screens/auth/OrganisationScreen';
import LoginScreen from '../screens/auth/LoginScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Organisation"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="Organisation"
        component={OrganisationScreen}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
