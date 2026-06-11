import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import DashboardScreen from '../screens/app/DashboardScreen';
import ListViewScreen from '../screens/app/ListViewScreen';
const Stack = createNativeStackNavigator();

const AppStack = () => {
  return (
   <Stack.Navigator>

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