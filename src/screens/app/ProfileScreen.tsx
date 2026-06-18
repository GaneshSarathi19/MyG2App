import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AppScreen from '../../components/layout/AppScreen';
import AppHeader from '../../components/common/AppHeader';
import { InfoRow } from '../../components/common/InfoRow';
import { SectionCard } from '../../components/common/SectionCard';
import { AvatarBadge } from '../../components/common/AvatarBadge';
import { useAppSelector } from '../../redux/hooks';
import { Colors, Fonts } from '../../theme';

/* ─── Component ──────────────────────────────────────────────────────── */

const ProfileScreen: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return (
      <AppScreen style={styles.center}>
        <Text style={styles.emptyText}>No profile data available</Text>
      </AppScreen>
    );
  }

  const initials = `${user.FirstName?.charAt(0) || ''}${user.LastName?.charAt(0) || ''}`;
  const fullName = `${user.FirstName || ''} ${user.LastName || ''}`.trim();
  const mentorName = `${user.mentorFirstName || ''} ${user.mentorLastName || ''}`.trim();

  return (
    <AppScreen>
      <AppHeader title="My Profile" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Avatar Header ───────────────────────────────────────────── */}
        <View style={styles.avatarSection}>
          <AvatarBadge initials={initials} />
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.designation}>{user.Designation}</Text>
          <View style={styles.deptChip}>
            <Text style={styles.deptChipText}>{user.Department}</Text>
          </View>
        </View>

        {/* ── Employment ─────────────────────────────────────────────────── */}
        <SectionCard title="Employment">
          <InfoRow label="Employee Code" value={user.EmployeeCode} />
          <InfoRow label="Employee ID" value={user.EmployeeID} />
          <InfoRow label="Department" value={user.Department} />
          <InfoRow label="Designation" value={user.Designation} />
          <InfoRow label="Tech Stream" value={user.TechStream} />
          <InfoRow label="Date of Joining" value={user.DateOfJoining} />
          <InfoRow label="Resource No" value={user.ResourceNo} />
          <InfoRow label="Resource" value={user.ResourceName} />
          <InfoRow
            label="Internal Resource"
            value={user.IsInternalResource ? 'Yes' : 'No'}
          />
        </SectionCard>

        {/* ── Personal ──────────────────────────────────────────────────── */}
        <SectionCard title="Personal Information">
          <InfoRow label="Full Name" value={fullName} />
          <InfoRow label="Father's Name" value={user.FatherName} />
          <InfoRow label="Date of Birth" value={user.DateOfBirth} />
          <InfoRow label="Marital Status" value={user.MaritalStatus} />
          <InfoRow label="Blood Group" value={user.BloodGroup} />
        </SectionCard>

        {/* ── Contact ───────────────────────────────────────────────────── */}
        <SectionCard title="Contact">
          <InfoRow label="Corporate Email" value={user.CorporateEmailID} />
        </SectionCard>

        {/* ── Mentor ────────────────────────────────────────────────────── */}
        <SectionCard title="Mentor">
          <InfoRow label="Name" value={mentorName} />
          <InfoRow label="Email" value={user.mentorCorporateEmailID} />
        </SectionCard>

        {/* ── Documents / IDs ───────────────────────────────────────────── */}
        <SectionCard title="Documents">
          <InfoRow label="PAN No" value={user.PANNo} />
          <InfoRow label="PF No" value={user.PFNo} />
          <InfoRow label="ESI No" value={user.ESINo} />
          <InfoRow label="Passport No" value={user.PassPortNo} />
        </SectionCard>
      </ScrollView>
    </AppScreen>
  );
};

/* ─── Styles ──────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Fonts.sizes.md,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  name: {
    fontSize: Fonts.sizes.lg,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  designation: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  deptChip: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  deptChipText: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
});

export default ProfileScreen;
