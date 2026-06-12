import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import {useAuth} from '../../context/AuthContext';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '../../theme/colors';

const DashboardScreen = () => {
  const {logout} = useAuth();
  const navigation = useNavigation();

  const [showDetails, setShowDetails] =
    useState(false);

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? 'Good Morning'
      : hour < 18
      ? 'Good Afternoon'
      : 'Good Evening';

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={
        styles.scrollContent
      }>
      {/* Greeting */}

      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>
          👋 {greeting}, John
        </Text>

        {/* <Text style={styles.designation}>
          Software Engineer
        </Text> */}
      </View>

      {/* Quick Stats */}

      <Text style={styles.sectionTitle}>
        📊 Quick Stats
      </Text>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            95%
          </Text>

          <Text style={styles.statLabel}>
            Attendance
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            3
          </Text>

          <Text style={styles.statLabel}>
            Leaves Left
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            12
          </Text>

          <Text style={styles.statLabel}>
            Active Tasks
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            3
          </Text>

          <Text style={styles.statLabel}>
            Years Exp.
          </Text>
        </View>
      </View>

      {/* My Corner */}

      <Text style={styles.sectionTitle}>
        🏠 My Corner
      </Text>

      <TouchableOpacity
        style={styles.cornerCard}
        activeOpacity={0.8}
        onPress={() =>
          setShowDetails(!showDetails)
        }>
        <Text style={styles.employeeName}>
          John Smith
        </Text>

        <Text style={styles.employeeInfo}>
          EMP001 • Mobile Development
        </Text>

        <Text style={styles.viewDetails}>
          {showDetails
            ? '▲ Hide Details'
            : '▼ View Details'}
        </Text>

        {showDetails && (
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Email
              </Text>

              <Text style={styles.detailValue}>
                john@company.com
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Department
              </Text>

              <Text style={styles.detailValue}>
                Mobile Development
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Manager
              </Text>

              <Text style={styles.detailValue}>
                David Wilson
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Joining Date
              </Text>

              <Text style={styles.detailValue}>
                12 Jan 2023
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Location
              </Text>

              <Text style={styles.detailValue}>
                Coimbatore
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Quick Actions */}

<View style={styles.quickActionsGrid}>
<TouchableOpacity style={styles.quickCard}>
  <Text style={styles.quickIcon}>
    🎫
  </Text>

  <Text style={styles.quickTitle}>
    Tickets
  </Text>

  <Text style={styles.quickSub}>
    Raise Support Requests
  </Text>
</TouchableOpacity>
<TouchableOpacity style={styles.quickCard}>
  <Text style={styles.quickIcon}>
    🍽️
  </Text>

  <Text style={styles.quickTitle}>
    Snack Bar
  </Text>

  <Text style={styles.quickSub}>
    Order Refreshments
  </Text>
</TouchableOpacity>
  <TouchableOpacity style={styles.quickCard}>
    <Text style={styles.quickIcon}>📅</Text>
    <Text style={styles.quickTitle}>Attendance</Text>
    <Text style={styles.quickSub}>
      Check In & Out
    </Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.quickCard}>
    <Text style={styles.quickIcon}>📝</Text>
    <Text style={styles.quickTitle}>Leaves</Text>
    <Text style={styles.quickSub}>
      Apply Leave
    </Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.quickCard}>
    <Text style={styles.quickIcon}>📋</Text>
    <Text style={styles.quickTitle}>Tasks</Text>
    <Text style={styles.quickSub}>
      Active Work
    </Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.quickCard}>
    <Text style={styles.quickIcon}>👤</Text>
    <Text style={styles.quickTitle}>My Corner</Text>
    <Text style={styles.quickSub}>
      Profile
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.quickCard}
    onPress={() =>
      navigation.navigate(
        'DemoListView' as never,
      )
    }>
    <Text style={styles.quickIcon}>🌐</Text>
    <Text style={styles.quickTitle}>ListView</Text>
    <Text style={styles.quickSub}>
      Demo API
    </Text>
  </TouchableOpacity>

  <TouchableOpacity style={styles.quickCard}>
    <Text style={styles.quickIcon}>⚙️</Text>
    <Text style={styles.quickTitle}>Settings</Text>
    <Text style={styles.quickSub}>
      Preferences
    </Text>
  </TouchableOpacity>

</View>      {/* Company Updates */}

      <Text style={styles.sectionTitle}>
        📢 Upcoming Events
      </Text>

      <View style={styles.updateCard}>
        <Text style={styles.updateText}>
          • Sprint Review -
          Friday
        </Text>

        <Text style={styles.updateText}>
          • Team Meeting - 3 PM
        </Text>

        <Text style={styles.updateText}>
          • HR Circular Updated
        </Text>
      </View>

      {/* Logout */}

      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={logout}>
        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  greetingContainer: {
    marginBottom: 25,
  },

  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
  },

  designation: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },

  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent:
      'space-between',
    marginBottom: 25,
  },

  statCard: {
    width: '48%',
    backgroundColor:
      COLORS.card,
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
  },

  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },

  statLabel: {
    marginTop: 5,
    color: COLORS.textSecondary,
    fontSize: 14,
  },

  cornerCard: {
    backgroundColor:
      COLORS.card,
    borderRadius: 14,
    padding: 18,
    marginBottom: 25,
    elevation: 3,
  },
quickActionsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  marginBottom: 25,
},

quickCard: {
  width: '48%',
  backgroundColor: '#FFFFFF',
  borderRadius: 14,
  padding: 15,
  marginBottom: 12,
  elevation: 3,
},

quickIcon: {
  fontSize: 22,
  marginBottom: 12,
},

quickTitle: {
  fontSize: 15,
  fontWeight: '700',
  color: COLORS.textPrimary,
},

quickSub: {
  marginTop: 3,
  fontSize: 12,
  color: COLORS.textSecondary,
},
  employeeName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },

  employeeInfo: {
    marginTop: 4,
    color: COLORS.textSecondary,
  },

  viewDetails: {
    marginTop: 12,
    color: COLORS.secondary,
    fontWeight: '600',
  },

  detailsContainer: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.border,
    paddingTop: 15,
  },

  detailRow: {
    marginBottom: 12,
  },

  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  detailValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    marginTop: 2,
  },

  actionsContainer: {
    marginBottom: 25,
  },

  actionCard: {
    backgroundColor:
      COLORS.card,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    elevation: 3,

    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIcon: {
    fontSize: 24,
    marginRight: 15,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  actionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  updateCard: {
    backgroundColor:
      COLORS.card,
    borderRadius: 14,
    padding: 18,
    marginBottom: 25,
    elevation: 3,
  },

  updateText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },

  logoutBtn: {
    backgroundColor: '#C8102E',
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    elevation: 3,
  },

  logoutText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default DashboardScreen;