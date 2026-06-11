import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
const Stack = createNativeStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MyG2"
  component={LoginScreen}      />
    </Stack.Navigator>
  );
};

export default AppStack;