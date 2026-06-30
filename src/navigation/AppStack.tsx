import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DashboardScreen from '../screens/app/DashboardScreen';
import HolidayCalendarScreen
from '../screens/app/HolidayCalendarScreen';
import ProfileScreen from '../screens/app/ProfileScreen';
import EmployeesScreen from '../screens/app/EmployeesScreen';
import ApplyLeaveScreen from '../screens/app/ApplyLeaveScreen';
import SettingsScreen from '../screens/app/SettingsScreen';
import NotificationsScreen from '../screens/app/NotificationsScreen';
import SnackBarWalletScreen from '../screens/app/SnackBarWalletScreen';
import ProjectListScreen from '../screens/app/ProjectListScreen';
import ProjectDetailScreen from '../screens/app/ProjectDetailScreen';
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
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
      />
      <Stack.Screen
        name="SnackBarWallet"
        component={SnackBarWalletScreen}
      />
      <Stack.Screen
        name="ProjectList"
        component={ProjectListScreen}
      />
      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
