import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DashboardScreen from '../screens/app/DashboardScreen';
import HolidayCalendarScreen
from '../screens/app/HolidayCalendarScreen';
import ProfileScreen from '../screens/app/ProfileScreen';
import EmployeesScreen from '../screens/app/EmployeesScreen';
import ApplyLeaveScreen from '../screens/app/ApplyLeaveScreen';
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
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
      />
      <Stack.Screen
        name="Employees"
        component={EmployeesScreen}
      />
      <Stack.Screen
        name="ApplyLeave"
        component={ApplyLeaveScreen}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
