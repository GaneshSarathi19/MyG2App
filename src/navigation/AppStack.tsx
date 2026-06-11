import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import DashboardScreen from '../screens/app/DashboardScreen';
import ListViewScreen from '../screens/app/ListViewScreen';
import {COLORS} from '../theme/colors';
const Stack = createNativeStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
      />

      <Stack.Screen
        name="DemoListView"
        component={ListViewScreen}
        options={{
          title: 'Demo ListView',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppStack;