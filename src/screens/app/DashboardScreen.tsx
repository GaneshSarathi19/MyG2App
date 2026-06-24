import React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import {useAppSelector} from '../../redux/hooks';
import {useDrawer} from '../../context/DrawerContext';
import { Colors } from '../../theme';
import AppScreen from '../../components/layout/AppScreen';
import AvatarBadge from '../../components/common/AvatarBadge';
import {getProfileImageUri} from '../../utils/profileImage';
import { useNavigation } from '@react-navigation/native';
import type {Organisation} from '../../redux/slices/organisationSlice';

const G2_LOGO = require('../../resources/g2logo-small.png') as number;
const CG_VAK_LOGO = require('../../resources/cgvaklogo-small.png') as number;

const ORG_LOGOS: Record<string, any> = {
  'G2': G2_LOGO,
  'CG-Vak': CG_VAK_LOGO,
};
import HolidayBanner
from '../../components/common/HolidayBanner';
/* ─── Styles ──────────────────────────────────────────────────────── */
const screenWidth = Dimensions.get('window').width;
const COL_WIDTH = Math.floor((screenWidth - 48) / 2);

/* ─── Data ────────────────────────────────────────────────────────── */
interface CardItem {
  id: string;
  title: string;
  sub: string;
  abbr: string;
  colors: string;
  badge?: number;
}
const CARDS: CardItem[] = [
  { id: 'attendance', title: 'Attendance', sub: 'Check-in & logs', abbr: 'A', colors: Colors.danger, badge: 1 },
  { id: 'leave', title: 'Apply Leave', sub: 'Request time off', abbr: 'L', colors: Colors.primary },
  { id: 'holiday', title: 'Holiday Calendar', sub: 'Upcoming holidays', abbr: 'H', colors: Colors.secondary },
  { id: 'meetings', title: 'Meetings', sub: 'Scheduled today', abbr: 'M', colors: Colors.danger, badge: 3 },
  { id: 'helpdesk', title: 'IT Helpdesk', sub: 'Report issues', abbr: 'IT', colors: Colors.primary },
  { id: 'projects', title: 'Assigned Projects', sub: 'Active work items', abbr: 'P', colors: Colors.secondary },
  { id: 'organisation', title: 'My Organisation', sub: 'Employee directory', abbr: 'MO', colors: Colors.primary, badge: 0 },
  { id: 'profile', title: 'My Profile', sub: 'Skills & info', abbr: 'MP', colors: Colors.danger },
  { id: 'shift', title: 'Work Shift', sub: 'Schedule & avail.', abbr: 'WS', colors: Colors.primary },
  { id: 'news', title: 'News & Announcements', sub: 'Company updates', abbr: 'N', colors: Colors.secondary, badge: 2 },
];
 
const buildStats = (department: string | undefined) => [
  { label: 'Department', value: department || '-', color: Colors.primary },
  { label: 'Pending Leaves', value: '2', color: Colors.secondary },
  { label: 'Meetings Today', value: '5', color: Colors.danger },
];


const ActionCard: React.FC<{
  item: CardItem;
  onPress?: () => void;
}> = ({ item: d, onPress }) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.82}
    onPress={onPress}
  >
    {d.badge !== undefined && (
      <View
        style={[
          styles.badge,
          { backgroundColor: d.colors },
        ]}
      >
        <Text style={styles.badgeText}>
          {d.badge}
        </Text>
      </View>
    )}

    <View
      style={[
        styles.iconWrap,
        {
          backgroundColor: `${d.colors}10`,
          borderColor: `${d.colors}40`,
        },
      ]}
    >
      <Text
        style={[
          styles.iconChar,
          { color: d.colors },
        ]}
      >
        {d.abbr}
      </Text>
    </View>

    <Text
      style={styles.cardTitle}
      numberOfLines={1}
    >
      {d.title}
    </Text>

    <Text style={styles.cardSub}>
      {d.sub}
    </Text>
  </TouchableOpacity>
);;
 
/**
 * Returns a time-of-day greeting based on the current hour.
 */
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};
 
/* ─── Screen ──────────────────────────────────────────────────────── */
const DashboardScreen = () => {
   const [isCompactHeader, setIsCompactHeader] =
    useState(false);
  const user = useAppSelector(state => state.auth.user);
  const selectedOrganisation = useAppSelector(
    state => state.organisation.selectedOrganisation,
  );
  const {toggle} = useDrawer();
     const navigation = useNavigation<any>();

  const initials = `${user?.FirstName?.charAt(0) || ''}${user?.LastName?.charAt(0) || ''}`;
const [showHolidayBanner,
setShowHolidayBanner] =
useState(true);
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
 
  return (
    <AppScreen>
      {/* header */}
<View style={styles.header}>
  {isCompactHeader ? (
    <View style={styles.compactHeader}>
      <TouchableOpacity
        onPress={toggle}
        style={styles.hamburger}
      >
        <Text style={styles.hamburgerIcon}>
          ☰
        </Text>
      </TouchableOpacity>

      <AvatarBadge
        initials={initials}
        size={32}
        imageUrl={getProfileImageUri(user?.ProfilePicture)}
      />
      <Text style={styles.compactName}>
        {getGreeting()}, {user?.FirstName}
      </Text>
      {selectedOrganisation && (
        <Image
          source={ORG_LOGOS[selectedOrganisation]}
          style={styles.compactOrgLogo}
          resizeMode="contain"
        />
      )}
    </View>
  ) : (
    <>
      <View style={styles.headerTopRow}>
        <TouchableOpacity
          onPress={toggle}
          style={styles.hamburger}
        >
          <Text style={styles.hamburgerIcon}>
            ☰
          </Text>
        </TouchableOpacity>

        <View style={styles.dateChip}>
          <Text style={styles.dateTxt}>
            {today}
          </Text>
        </View>
      </View>

      <View style={styles.headerProfileRow}>
        <AvatarBadge
          initials={initials}
          size={50}
          imageUrl={getProfileImageUri(user?.ProfilePicture)}
        />
        <View style={styles.headerProfileText}>
          <Text style={styles.greeting}>
            {getGreeting()},
          </Text>
          <Text style={styles.name}>
            {user?.FirstName}
          </Text>
          <Text style={styles.designation}>
            {user?.Designation}
          </Text>
        </View>
        {selectedOrganisation && (
          <Image
            source={ORG_LOGOS[selectedOrganisation]}
            style={styles.headerOrgLogo}
            resizeMode="contain"
          />
        )}
      </View>
    </>
  )}
</View>
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}
     onScroll={(event) => {
    const offset =
      event.nativeEvent.contentOffset.y;

    setIsCompactHeader(offset > 80);
  }}
  scrollEventThrottle={16}>
     {showHolidayBanner && (
  <HolidayBanner
    title="🎄 Christmas Tomorrow"
    subtitle="15 Hours Remaining"
    onClose={() =>
      setShowHolidayBanner(false)
    }
  />
)}
 
      {/* Quick Stats */}
      <View style={styles.statsRow}>
        {buildStats(user?.Department).map((s) => (
          <View key={s.label} style={styles.statBox}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
            <View style={[styles.statBar, { backgroundColor: s.color }]} />
          </View>
        ))}
      </View>
 
      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.heading}>Quick Actions</Text>
        <View style={styles.grid}>
        {CARDS.map((c) => (
  <ActionCard
    key={c.id}
    item={c}
    onPress={() => {
      switch (c.id) {
        case 'holiday':
          navigation.navigate('HolidayCalendar');
          break;
        case 'profile':
          navigation.navigate('Profile');
          break;
        case 'organisation':
          navigation.navigate('Employees');
          break;
        case 'leave':
          navigation.navigate('ApplyLeave');
          break;
        default:
          console.log(`${c.title} clicked`);
      }
    }}
  />
))}
        </View>
      </View>
 
      {/* Announcements */}
      <View style={styles.section}>
        <Text style={styles.heading}>Latest Announcements</Text>
        <View style={styles.annCard}>
          <View style={[styles.annDot, { backgroundColor: Colors.secondary }]} />
          <View style={styles.annContent}>
            <Text style={styles.annTitle}>Q2 Performance Review</Text>
            <Text style={styles.annDesc}>All teams to attend the quarterly review on Friday at 2:00 PM.</Text>
            <Text style={styles.annTime}>Today, 10:30 AM</Text>
          </View>
        </View>
        <View style={styles.annCard}>
          <View style={[styles.annDot, { backgroundColor: Colors.danger }]} />
          <View style={styles.annContent}>
            <Text style={styles.annTitle}>Updated Health Benefits</Text>
            <Text style={styles.annDesc}>New health insurance policies are now available in the HR portal.</Text>
            <Text style={styles.annTime}>Yesterday, 3:45 PM</Text>
          </View>
        </View>
      </View>
 

    </ScrollView>
    </AppScreen>
  );
};
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.subtle },

  // Header
 header: {
  backgroundColor: Colors.primary,
  paddingTop: 16,
  paddingBottom: 20,
  paddingHorizontal: 20,

  elevation: 4,

  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.12,
  shadowRadius: 4,

  zIndex: 100,
},
compactHeader: {
  flexDirection: 'row',
  alignItems: 'center',
},

compactName: {
  color: Colors.white,
  fontSize: 16,
  fontWeight: '700',
  marginLeft: 12,
  flex: 1,
},
headerProfileRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 8,
},
headerProfileText: {
  marginLeft: 14,
  flex: 1,
},
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scrollContent: {
  paddingBottom: 32,
},
  hamburger: {
    padding: 4,
  },
  hamburgerIcon: {
    fontSize: 22,
    color: Colors.white,
  },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.72)' },
  name: { fontSize: 22, fontWeight: '700', color: Colors.white },
  designation: { fontSize: 13, color: 'rgba(255,255,255,0.60)', marginTop: 2 },
  dateChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dateTxt: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontWeight: '500' },
  statBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  heading: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },

  // Grid Cards
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: COL_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    position: 'relative',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
  },
  iconChar: { fontSize: 14, fontWeight: '700' },
  cardTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  cardSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },

  // Badge
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },

  // Announcements
  annCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  annDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, marginRight: 12 },
  annContent: { flex: 1 },
  annTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  annDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  annTime: { fontSize: 11, color: '#A0A0A0', marginTop: 6 },

  headerOrgLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginLeft: 12,
  },

  compactOrgLogo: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginLeft: 8,
  },

});
export default DashboardScreen;
