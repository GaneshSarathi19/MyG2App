import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useAppSelector, useAppDispatch} from '../../redux/hooks';
import {logout} from '../../redux/slices/authSlice';
import {useDrawer} from '../../context/DrawerContext';


const { width } = Dimensions.get('window');

const COLORS = {
  red: '#C5122C',
  navy: '#003C64',
  orange: '#F86F18',
  gray: '#706B6B',
  subtle: '#F5F6F8',
  white: '#FFFFFF',
  dark: '#1A1A2E',
};

/* ─── Data ────────────────────────────────────────────────────────── */
interface CardItem {
  id: string;
  title: string;
  sub: string;
  abbr: string;
  color: string;
  badge?: number;
}

const CARDS: CardItem[] = [
  { id: 'attendance', title: 'Attendance', sub: 'Check-in & logs', abbr: 'A', color: COLORS.red, badge: 1 },
  { id: 'leave', title: 'Apply Leave', sub: 'Request time off', abbr: 'L', color: COLORS.navy },
  { id: 'holiday', title: 'Holiday Calendar', sub: 'Upcoming holidays', abbr: 'H', color: COLORS.orange },
  { id: 'meetings', title: 'Meetings', sub: 'Scheduled today', abbr: 'M', color: COLORS.red, badge: 3 },
  { id: 'helpdesk', title: 'IT Helpdesk', sub: 'Report issues', abbr: 'IT', color: COLORS.navy },
  { id: 'projects', title: 'Assigned Projects', sub: 'Active work items', abbr: 'P', color: COLORS.orange },
  { id: 'profile', title: 'My Profile', sub: 'Skills & info', abbr: 'MP', color: COLORS.red },
  { id: 'shift', title: 'Work Shift', sub: 'Schedule & avail.', abbr: 'WS', color: COLORS.navy },
  { id: 'news', title: 'News & Announcements', sub: 'Company updates', abbr: 'N', color: COLORS.orange, badge: 2 },
];

const buildStats = (department: string | undefined) => [
  { label: 'Department', value: department || '-', color: COLORS.navy },
  { label: 'Pending Leaves', value: '2', color: COLORS.orange },
  { label: 'Meetings Today', value: '5', color: COLORS.red },
];

/* ─── Components ────────────────────────────────────────────────── */
const ActionCard: React.FC<{ item: CardItem }> = ({ item: d }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.82}>
    {d.badge !== undefined && (
      <View style={[styles.badge, { backgroundColor: COLORS.red }]}>
        <Text style={styles.badgeText}>{d.badge}</Text>
      </View>
    )}
    <View style={[styles.iconWrap, { backgroundColor: `${d.color}10`, borderColor: `${d.color}40` }]}>
      <Text style={[styles.iconChar, { color: d.color }]}>{d.abbr}</Text>
    </View>
    <Text style={styles.cardTitle} numberOfLines={1}>{d.title}</Text>
    <Text style={styles.cardSub}>{d.sub}</Text>
  </TouchableOpacity>
);

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
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const {toggle} = useDrawer();
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={toggle} style={styles.hamburger} accessibilityRole="button" accessibilityLabel="Open menu">
            <Text style={styles.hamburgerIcon}>☰</Text>
          </TouchableOpacity>
          <View style={styles.dateChip}>
            <Text style={styles.dateTxt}>{today}</Text>
          </View>
        </View>
        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={styles.name}>{user?.FirstName || 'User'}</Text>
        <Text style={styles.designation}>{user?.Designation || ''}</Text>
      </View>

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
            <ActionCard key={c.id} item={c} />
          ))}
        </View>
      </View>

      {/* Announcements */}
      <View style={styles.section}>
        <Text style={styles.heading}>Latest Announcements</Text>
        <View style={styles.annCard}>
          <View style={[styles.annDot, { backgroundColor: COLORS.orange }]} />
          <View style={styles.annContent}>
            <Text style={styles.annTitle}>Q2 Performance Review</Text>
            <Text style={styles.annDesc}>All teams to attend the quarterly review on Friday at 2:00 PM.</Text>
            <Text style={styles.annTime}>Today, 10:30 AM</Text>
          </View>
        </View>
        <View style={styles.annCard}>
          <View style={[styles.annDot, { backgroundColor: COLORS.red }]} />
          <View style={styles.annContent}>
            <Text style={styles.annTitle}>Updated Health Benefits</Text>
            <Text style={styles.annDesc}>New health insurance policies are now available in the HR portal.</Text>
            <Text style={styles.annTime}>Yesterday, 3:45 PM</Text>
          </View>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => dispatch(logout())}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

/* ─── Styles ──────────────────────────────────────────────────────── */
const COL_WIDTH = Math.floor((width - 48) / 2);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.subtle, marginBottom: 55 },

  // Header
  header: {//sticky
    backgroundColor: COLORS.navy,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hamburger: {
    padding: 4,
  },
  hamburgerIcon: {
    fontSize: 22,
    color: COLORS.white,
  },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.72)' },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.white },
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
    backgroundColor: COLORS.white,
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
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.dark },
  statLabel: { fontSize: 11, color: COLORS.gray, marginTop: 2, fontWeight: '500' },
  statBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  heading: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 12 },

  // Grid Cards
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: COL_WIDTH,
    backgroundColor: COLORS.white,
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
  cardTitle: { fontSize: 13, fontWeight: '700', color: COLORS.dark },
  cardSub: { fontSize: 11, color: COLORS.gray, marginTop: 2 },

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
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },

  // Announcements
  annCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
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
  annTitle: { fontSize: 14, fontWeight: '700', color: COLORS.dark, marginBottom: 4 },
  annDesc: { fontSize: 12, color: COLORS.gray, lineHeight: 18 },
  annTime: { fontSize: 11, color: '#A0A0A0', marginTop: 6 },

  // Logout
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: COLORS.red,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    
  },
  logoutText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
});

export default DashboardScreen;
