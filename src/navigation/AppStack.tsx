import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import DashboardScreen from '../screens/app/DashboardScreen';
import { useDrawer } from '../context/DrawerContext';

const Stack = createNativeStackNavigator();

const ToggleDrawerButton: React.FC = () => {
  const { toggle } = useDrawer();
  return (
    <TouchableOpacity onPress={toggle} style={styles.btn} accessibilityRole="button">
      <Text style={styles.icon}>☰</Text>
    </TouchableOpacity>
  );
};

const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerLeft: () => <ToggleDrawerButton /> }}
      />


    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({ btn: { padding: 8 }, icon: { fontSize: 20 } });

export default AppStack;