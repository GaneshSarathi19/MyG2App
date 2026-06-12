import React from 'react';
import {NavigationContainer} from '@react-navigation/native';

import AuthStack from './AuthStack';
import AppStack from './AppStack';
import {useAuth} from '../context/AuthContext';
import {DrawerProvider} from '../context/DrawerContext';
import SidePanel from '../components/SidePanel';


const RootNavigator = () => {
  const {isLoggedIn} = useAuth();

  return (
    <NavigationContainer>
      <DrawerProvider>
        {isLoggedIn ? <AppStack /> : <AuthStack />}
        <SidePanel />
      </DrawerProvider>
    </NavigationContainer>
  );
};

export default RootNavigator;