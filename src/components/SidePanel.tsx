import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useDrawer } from '../context/DrawerContext';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme';
import AvatarBadge from './common/AvatarBadge';
import { getProfileImageUri } from '../utils/profileImage';

const { width } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(360, Math.round(width * 0.82));

type AppStackParamList = {
  Dashboard: undefined;
  HolidayCalendar: undefined;
  ApplyLeave: undefined;
  Profile: undefined;
  Settings: undefined;
  Employees: undefined;
  Notifications: undefined;
};

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  screen?: keyof AppStackParamList;
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

const MENU_SECTIONS: MenuSection[] = [
  {
    items: [
      { id: 'profile', label: 'My Profile', icon: 'P', color: Colors.primary, screen: 'Profile' },
      { id: 'notifications', label: 'Notifications', icon: 'N', color: Colors.secondary, screen: 'Notifications' },
      { id: 'settings', label: 'Settings', icon: 'S', color: '#374151', screen: 'Settings' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { id: 'appearance', label: 'Appearance', icon: 'A', color: '#7C3AED' },
      { id: 'language', label: 'Language', icon: 'L', color: '#0891B2' },
      { id: 'security', label: 'Security', icon: 'K', color: '#DC2626' },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: 'help', label: 'Help & Support', icon: '?', color: '#EA580C' },
      { id: 'feedback', label: 'Feedback', icon: 'F', color: '#16A34A' },
      { id: 'about', label: 'About Application', icon: 'i', color: '#6B7280' },
    ],
  },
];

const IconBubble: React.FC<{ icon: string; color: string }> = ({ icon, color }) => (
  <View style={[styles.iconBubble, { backgroundColor: `${color}14` }]}>
    <Text style={[styles.iconBubbleText, { color }]}>{icon}</Text>
  </View>
);

const MenuRow: React.FC<{
  item: MenuItem;
  isActive: boolean;
  onPress: () => void;
}> = ({ item, isActive, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.menuRow,
          isActive && styles.menuRowActive,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <IconBubble icon={item.icon} color={item.color} />
        <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
          {item.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const findCurrentRoute = (s: any): string => {
  if (s.routes && s.index !== undefined) {
    const route = s.routes[s.index];
    if (route.state) return findCurrentRoute(route.state);
    return route.name;
  }
  return s.name || '';
};

const SidePanel: React.FC = () => {
  const { open, closeDrawer } = useDrawer();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { logout, user } = useAuth();
  const anim = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = React.useState(false);
  const [activeRouteName, setActiveRouteName] = React.useState('');

  React.useEffect(() => {
    const state = navigation.getState();
    if (state) setActiveRouteName(findCurrentRoute(state));
    const unsubscribe = navigation.addListener('state', e => {
      const nextState = e.data.state;
      if (nextState) setActiveRouteName(findCurrentRoute(nextState));
    });
    return unsubscribe;
  }, [navigation]);

  const initials =
    `${user?.FirstName?.charAt(0) || ''}${user?.LastName?.charAt(0) || ''}`;
  const employeeId = user?.EmployeeID || user?.EmployeeCode || '-';

  useEffect(() => {
    if (open) setVisible(true);
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      if (!open) setVisible(false);
    });
  }, [open, anim]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-PANEL_WIDTH, 0],
  });

  const backdropOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  const handleNavigate = (screen?: keyof AppStackParamList) => {
    if (!screen) return;
    closeDrawer();
    setTimeout(() => navigation.navigate(screen as any), 200);
  };

  const handleLogout = () => {
    closeDrawer();
    setTimeout(() => logout(), 250);
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={closeDrawer} />
      </Animated.View>

      <Animated.View style={[styles.panel, { transform: [{ translateX }] }]}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Profile Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleNavigate('Profile')}
            style={styles.profileCard}
          >
            <View style={styles.profileAccent} />
            <View style={styles.profileCardBody}>
              <View style={styles.avatarWrap}>
                <AvatarBadge
                  initials={initials}
                  size={64}
                  imageUrl={getProfileImageUri(user?.ProfilePicture)}
                />
                <View style={styles.statusDot} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {user?.FirstName} {user?.LastName}
                </Text>
                <Text style={styles.profileDesignation} numberOfLines={1}>
                  {user?.Designation}
                </Text>
                <Text style={styles.profileSub} numberOfLines={1}>
                  ID: {employeeId}
                </Text>
                <Text style={styles.profileSub} numberOfLines={1}>
                  {user?.CorporateEmailID}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Menu Items */}
          <ScrollView
            style={styles.menuScroll}
            contentContainerStyle={styles.menuContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {MENU_SECTIONS.map((section, idx) => (
              <View key={`section-${idx}`}>
                {section.title ? (
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                ) : null}
                {section.items.map(item => (
                  <MenuRow
                    key={item.id}
                    item={item}
                    isActive={activeRouteName === item.screen}
                    onPress={() => handleNavigate(item.screen)}
                  />
                ))}
                {idx < MENU_SECTIONS.length - 1 ? (
                  <View style={styles.sectionDivider} />
                ) : null}
              </View>
            ))}
          </ScrollView>

          {/* Bottom */}
          <View style={styles.bottomSection}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backdropTouch: {
    flex: 1,
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    backgroundColor: '#FAFBFC',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  safeArea: {
    flex: 1,
  },

  /* Profile Card */
  profileCard: {
    marginHorizontal: 14,
    marginTop: 16,
    marginBottom: 6,
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  profileAccent: {
    height: 4,
    backgroundColor: Colors.primary,
  },
  profileCardBody: {
    padding: 18,
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2.5,
    borderColor: Colors.white,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  profileDesignation: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 6,
  },
  profileSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 1,
  },

  /* Menu */
  menuScroll: {
    flex: 1,
  },
  menuContentContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 4,
    marginLeft: 14,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 1,
  },
  menuRowActive: {
    backgroundColor: `${Colors.primary}0D`,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconBubbleText: {
    fontSize: 16,
    fontWeight: '700',
  },
  menuLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  menuLabelActive: {
    fontWeight: '700',
    color: Colors.primary,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
    marginHorizontal: 14,
  },

  /* Bottom */
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  logoutBtn: {
    backgroundColor: Colors.danger,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});

export default SidePanel;
