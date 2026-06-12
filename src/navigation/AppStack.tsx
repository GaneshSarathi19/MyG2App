import React from 'react';
import {Image} from 'react-native';
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
          backgroundColor:'#003B71',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}>
<Stack.Screen
  name="Dashboard"
  component={DashboardScreen}
  options={{
    headerRight: () => (
      <Image
        source={require('../assets/images/small_logo.png')}
        style={{
          width: 40,
          height: 40,
        }}
        resizeMode="contain"
      />
    ),
  }}
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