import React, { useEffect, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useDrawer } from '../context/DrawerContext';
import { useAuth } from '../context/AuthContext';
import Colors from '../theme/colors';

const { width } = Dimensions.get('window');

const PANEL_WIDTH = Math.min(
  360,
  Math.round(width * 0.82),
);

const SidePanel: React.FC = () => {
  const [visible, setVisible] = useState(false);

  const {
    open,
    closeDrawer,
  } = useDrawer();

  const { logout } = useAuth();

  const anim = React.useRef(
    new Animated.Value(0),
  ).current;

  const handleLogout = () => {
    closeDrawer();

    setTimeout(() => {
      logout();
    }, 250);
  };

  useEffect(() => {
    if (open) {
      setVisible(true);
    }

    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      if (!open) {
        setVisible(false);
      }
    });
  }, [open, anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-PANEL_WIDTH, 0],
  });

  const backdropOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35],
  });

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={closeDrawer}
        />
      </Animated.View>

      {/* Drawer Panel */}
      <Animated.View
        style={[
          styles.panel,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <SafeAreaView
          style={styles.safeArea}
          edges={['top', 'bottom']}
        >
          <View style={styles.container}>
            {/* Top Section */}
            <View style={styles.topContent}>
              <Text style={styles.header}>
                MyG2
              </Text>

              <TouchableOpacity
                style={styles.item}
              >
                <Text style={styles.itemText}>
                  Dashboard
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.item}
              >
                <Text style={styles.itemText}>
                  Holiday Calendar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.item}
              >
                <Text style={styles.itemText}>
                  Leave Management
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.item}
              >
                <Text style={styles.itemText}>
                  Attendance
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.item}
              >
                <Text style={styles.itemText}>
                  My Profile
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomContent}>
              <Text style={styles.version}>
                Version 1.0.0
              </Text>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutText}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    backgroundColor: Colors.white,
    elevation: 6,
  },

  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  topContent: {
    flex: 1,
    paddingTop: 12,
  },

  header: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 24,
  },

  item: {
    paddingVertical: 14,
  },

  itemText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },

  bottomContent: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 20,
  },

  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },

  logoutButton: {
    backgroundColor: Colors.danger,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },

  logoutText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default SidePanel;