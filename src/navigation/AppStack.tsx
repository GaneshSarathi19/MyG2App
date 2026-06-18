import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DashboardScreen from '../screens/app/DashboardScreen';
import HolidayCalendarScreen
from '../screens/app/HolidayCalendarScreen';
const Stack = createNativeStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
      />
      <Stack.Screen
        name="HolidayCalendar"
        component={HolidayCalendarScreen}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
