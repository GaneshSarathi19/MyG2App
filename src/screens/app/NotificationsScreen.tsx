import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme';
import AppScreen from '../../components/layout/AppScreen';
import AppHeader from '../../components/common/AppHeader';

const NotificationsScreen: React.FC = () => {
  return (
    <AppScreen>
      <AppHeader title="Notifications" showBack />
      <View style={styles.root}>
        <Text style={styles.emptyText}>No new notifications</Text>
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.subtle,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
});

export default NotificationsScreen;
