import React from 'react';
import {NavigationContainer} from '@react-navigation/native';

import AuthStack from './AuthStack';
import AppStack from './AppStack';
import {useAppSelector} from '../redux/hooks';
import {DrawerProvider} from '../context/DrawerContext';
import {SocketProvider} from '../context/SocketContext';
import SidePanel from '../components/SidePanel';

const RootNavigator = () => {
  const isLoggedIn = useAppSelector(state => state.auth?.isLoggedIn ?? false);

  return (
    <NavigationContainer>
      <DrawerProvider>
        <SocketProvider>
          {isLoggedIn ? <AppStack /> : <AuthStack />}
          <SidePanel />
        </SocketProvider>
      </DrawerProvider>
    </NavigationContainer>
  );
};

export default RootNavigator;
