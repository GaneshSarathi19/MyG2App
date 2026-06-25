import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AppScreen from '../../components/layout/AppScreen';
import { Colors, Fonts } from '../../theme';
import AppHeader from '../../components/common/AppHeader';

const MONTH_ORDER = [
  'January','February','March','April','May','June','July',
  'August','September','October','November','December',
];

interface Holiday {
  name: string;
  date: string;
  day: string;
}

const HOLIDAYS: Record<string, Holiday[]> = {
  January: [
    { name: "New Year's Day", date: '01 Jan 2026', day: 'Thursday' },
    { name: 'Pongal', date: '15 Jan 2026', day: 'Thursday' },
    { name: 'Republic Day', date: '26 Jan 2026', day: 'Monday' },
  ],
  April: [
    { name: 'Tamil New Year', date: '14 Apr 2026', day: 'Tuesday' },
  ],
  May: [
    { name: 'May Day', date: '01 May 2026', day: 'Friday' },
  ],
  August: [
    { name: 'Independence Day', date: '15 Aug 2026', day: 'Saturday' },
  ],
  October: [
    { name: 'Gandhi Jayanthi', date: '02 Oct 2026', day: 'Friday' },
    { name: 'Ayudha Pooja', date: '19 Oct 2026', day: 'Monday' },
  ],
  November: [
    { name: 'Diwali', date: '08 Nov 2026', day: 'Sunday' },
  ],
  December: [
    { name: 'Christmas', date: '25 Dec 2026', day: 'Friday' },
  ],
};

const parseDate = (dateStr: string): Date | null => {
  const parts = dateStr.split(' ');
  if (parts.length < 3) return null;
  const day = parseInt(parts[0], 10);
  const monthMap: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const month = monthMap[parts[1]];
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || month === undefined || isNaN(year)) return null;
  return new Date(year, month, day);
};

const getDateColor = (dateStr: string): string => {
  const parts = dateStr.split(' ');
  const monthMap: Record<string, string> = {
    Jan: '#C62828', Feb: '#7B1FA2', Mar: '#2E7D32',
    Apr: '#E65100', May: '#1565C0', Jun: '#00838F',
    Jul: '#4E342E', Aug: '#D84315', Sep: '#37474F',
    Oct: '#BF360C', Nov: '#4527A0', Dec: '#1B5E20',
  };
  return monthMap[parts[1]] || Colors.secondary;
};

const getDaysLeft = (dateStr: string): string => {
  const date = parseDate(dateStr);
  if (!date) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Completed';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `${diff} days left`;
};

export default function HolidayCalendarScreen() {
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  /* Determine next upcoming month with holidays */
  const { monthList, nextUpcoming } = useMemo(() => {
    const currentMonthIndex = new Date().getMonth();
    const months = MONTH_ORDER.filter((m) => HOLIDAYS[m]);
    const next = months.find((m) => MONTH_ORDER.indexOf(m) >= currentMonthIndex && HOLIDAYS[m].some((h) => {
      const d = parseDate(h.date);
      return d && d >= new Date();
    })) || months[0];
    return { monthList: months, nextUpcoming: next };
  }, []);

  // Initialize selectedMonth once
  if (!selectedMonth && nextUpcoming) {
    setSelectedMonth(nextUpcoming);
  }

  const holidays = selectedMonth ? HOLIDAYS[selectedMonth] : [];

  /* Always the overall next upcoming holiday — never changes on month selection */
  const nextOverallHoliday = useMemo(() => {
    const now = new Date();
    const all = Object.values(HOLIDAYS).flat();
    const upcoming = all.find((h) => {
      const d = parseDate(h.date);
      return d && d >= now;
    });
    return upcoming || all[0];
  }, []);

  return (
    <AppScreen>
      <AppHeader title="Holiday Calendar" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Upcoming holiday card — always shows the overall next holiday */}
        {nextOverallHoliday && (
          <View style={styles.upcomingCard}>
            <View style={styles.upcomingAccent} />
            <Text style={styles.upcomingLabel}>Upcoming Holiday</Text>
            <Text style={styles.upcomingName}>{nextOverallHoliday.name}</Text>
            <Text style={styles.upcomingDate}>{nextOverallHoliday.date}</Text>
            <Text style={styles.upcomingDay}>{nextOverallHoliday.day}</Text>
            <View style={styles.daysLeftBadge}>
              <Text style={styles.daysLeftText}>{getDaysLeft(nextOverallHoliday.date)}</Text>
            </View>
          </View>
        )}

        {/* Month selector chips */}
        <Text style={styles.selectorLabel}>Select Month</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipList}
          style={styles.chipScroll}
        >
          {monthList.map((month) => {
            const active = month === selectedMonth;
            return (
              <TouchableOpacity
                key={month}
                onPress={() => setSelectedMonth(month)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {month}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected month card */}
        {selectedMonth && holidays.length > 0 && (
          <View style={styles.monthCard}>
            <View style={styles.monthBanner}>
              <View>
                <Text style={styles.monthBannerTitle}>{selectedMonth}</Text>
                <Text style={styles.monthBannerYear}>2026</Text>
              </View>
              <View style={styles.monthCountBadge}>
                <Text style={styles.monthCountText}>{holidays.length}</Text>
              </View>
            </View>

            {/* Timeline holiday rows */}
            {holidays.map((holiday, index) => (
              <View key={index} style={styles.holidayBlock}>
                <View style={styles.timelineTrack}>
                  <View style={styles.timelineDot} />
                  {index < holidays.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={[styles.dateWedge, { backgroundColor: getDateColor(holiday.date) }]}>
                  <Text style={styles.dateWedgeDay}>
                    {holiday.date.split(' ')[0]}
                  </Text>
                  <Text style={styles.dateWedgeMonth}>
                    {holiday.date.split(' ')[1]}
                  </Text>
                </View>
                <View style={styles.holidayContent}>
                  <Text style={styles.holidayName}>{holiday.name}</Text>
                  <Text style={styles.holidayDay}>{holiday.day}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.subtle,
  },

  /* ── Upcoming card ───────────────────────────────────── */
  upcomingCard: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 20,
    paddingTop: 18,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  upcomingAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.secondary,
  },
  upcomingLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  upcomingName: {
    color: Colors.white,
    fontSize: 24,
    fontFamily: Fonts.bold,
    letterSpacing: 0.3,
  },
  upcomingDate: {
    color: Colors.white,
    fontSize: Fonts.sizes.md,
    fontFamily: Fonts.semiBold,
    marginTop: 8,
    opacity: 0.9,
  },
  upcomingDay: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  daysLeftBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 14,
    elevation: 2,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  daysLeftText: {
    color: Colors.white,
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.sizes.xs,
    letterSpacing: 0.3,
  },

  /* ── Month selector ──────────────────────────────────── */
  selectorLabel: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  chipScroll: {
    marginBottom: 16,
  },
  chipList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  chipText: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
  },

  /* ── Month card (replaces old dropdownCard) ──────────── */
  monthCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: Colors.white,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  monthBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  monthBannerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  monthBannerYear: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    marginTop: 2,
    letterSpacing: 1,
  },
  monthCountBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  monthCountText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.bold,
  },

  /* ── Timeline holiday block ──────────────────────────── */
  holidayBlock: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 18,
    alignItems: 'flex-start',
  },
  timelineTrack: {
    width: 20,
    alignItems: 'center',
    paddingTop: 6,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.secondary,
    elevation: 1,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  dateWedge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dateWedgeDay: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
    lineHeight: 18,
    marginTop: -2,
  },
  dateWedgeMonth: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 8,
    fontFamily: Fonts.semiBold,
    textTransform: 'uppercase',
    lineHeight: 10,
    letterSpacing: 0.5,
  },
  holidayContent: {
    flex: 1,
    paddingTop: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    paddingBottom: 18,
  },
  holidayName: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  holidayDay: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
});
