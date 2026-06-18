import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppScreen from '../../components/layout/AppScreen';
import { Colors } from '../../theme';
import AppHeader from '../../components/common/AppHeader';
const getDaysLeftText = () => {
  const today = new Date();

  const holidayDate = new Date('2026-08-15');

  const diffDays = Math.ceil(
    (holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) {
    return 'Completed';
  }

  if (diffDays === 0) {
    return 'Today';
  }

  if (diffDays === 1) {
    return 'Tomorrow';
  }

  return `${diffDays} Days Left`;
};
const HOLIDAYS = {
  January: [
    {
      name: "New Year's Day",
      date: '01 Jan 2026',
      day: 'Thursday',
    },
    {
      name: 'Pongal',
      date: '15 Jan 2026',
      day: 'Thursday',
    },
    {
      name: 'Republic Day',
      date: '26 Jan 2026',
      day: 'Monday',
    },
  ],

  April: [
    {
      name: 'Tamil New Year',
      date: '14 Apr 2026',
      day: 'Tuesday',
    },
  ],

  May: [
    {
      name: 'May Day',
      date: '01 May 2026',
      day: 'Friday',
    },
  ],

  August: [
    {
      name: 'Independence Day',
      date: '15 Aug 2026',
      day: 'Saturday',
    },
  ],

  October: [
    {
      name: 'Gandhi Jayanthi',
      date: '02 Oct 2026',
      day: 'Friday',
    },
    {
      name: 'Ayudha Pooja',
      date: '19 Oct 2026',
      day: 'Monday',
    },
  ],

  November: [
    {
      name: 'Diwali',
      date: '08 Nov 2026',
      day: 'Sunday',
    },
  ],

  December: [
    {
      name: 'Christmas',
      date: '25 Dec 2026',
      day: 'Friday',
    },
  ],
};

export default function HolidayCalendarScreen() {
  const upcomingHoliday = {
    name: 'Independence Day',
    date: '15 Aug 2026',
    day: 'Saturday',
  };
  const currentMonth = new Date().toLocaleString('default', {
    month: 'long',
  });
  const navigation = useNavigation<any>();
  const [expandedMonth, setExpandedMonth] = useState(currentMonth);

  return (
    <AppScreen>
      <AppHeader title="Holiday Calendar" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.upcomingCard}>
          <Text style={styles.upcomingLabel}>🎉 Upcoming Holiday</Text>

          <Text style={styles.upcomingName}>{upcomingHoliday.name}</Text>

          <Text style={styles.upcomingDate}>{upcomingHoliday.date}</Text>

          <Text style={styles.upcomingDay}>{upcomingHoliday.day}</Text>

          <View style={styles.daysLeftBadge}>
            <Text style={styles.daysLeftText}>{getDaysLeftText()}</Text>
          </View>
        </View>
        {Object.entries(HOLIDAYS).map(([month, holidays]) => {
          const expanded = expandedMonth === month;

          return (
            <View key={month} style={styles.monthCard}>
              <TouchableOpacity
                style={styles.monthHeader}
                onPress={() => setExpandedMonth(expanded ? '' : month)}
              >
                <Text style={styles.monthText}>{month}</Text>

                <Text>{expanded ? '▼' : '▶'}</Text>
              </TouchableOpacity>

              {expanded &&
                holidays.map((holiday, index) => (
                  <View key={index} style={styles.holidayRow}>
                    <View style={styles.dateBadge}>
                      <Text style={styles.dateText}>
                        {holiday.date.split(' ')[0]}
                      </Text>
                    </View>

                    <View style={styles.holidayInfo}>
                      <Text style={styles.holidayName}>{holiday.name}</Text>

                      <Text style={styles.holidayDay}>{holiday.day}</Text>
                    </View>
                  </View>
                ))}
            </View>
          );
        })}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.subtle,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    margin: 16,
  },

  monthCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  backIcon: {
    fontSize: 20,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  monthHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  monthText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  upcomingCard: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },

  upcomingLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 8,
  },

  upcomingName: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700',
  },

  upcomingDate: {
    color: Colors.white,
    fontSize: 16,
    marginTop: 6,
  },

  upcomingDay: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  daysLeftBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },

  daysLeftText: {
    color: Colors.white,
    fontWeight: '600',
  },
  holidayRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },

  dateBadge: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dateText: {
    color: Colors.white,
    fontWeight: '700',
  },

  holidayInfo: {
    marginLeft: 12,
  },

  holidayName: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  holidayDay: {
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
