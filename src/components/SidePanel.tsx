import React, { useEffect, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { useDrawer } from '../context/DrawerContext';
import Colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';


const { width } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(360, Math.round(width * 0.82));

const SidePanel: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const { open, closeDrawer } = useDrawer();
  const { logout } = useAuth();
  const anim = React.useRef(new Animated.Value(0)).current;

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
  }, [anim, open]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-PANEL_WIDTH, 0],
  });

  if (!visible) return null;
  const backdropOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35],
  });

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={closeDrawer}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.panel,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        {/* menu content */}
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
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    backgroundColor: '#fff',
    padding: 16,
    elevation: 6,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: Colors.primaryText,
  },
  item: { paddingVertical: 12 },
  itemText: { fontSize: 16, color: Colors.primaryText },
  sep: { height: 1, backgroundColor: '#EEE', marginVertical: 12 },
});

export default SidePanel;
